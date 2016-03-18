# TODO: Implement better error messages and logging.

module CaffeineLabs
  module ChannelCli
    class Chan < Thor
      desc 'create <channel_id>',
           'Creates a channel recipe by fetching channel information from the Web API and saving it in the filesystem.'
      method_option 'output', type: :string, desc: 'Output path', aliases: '-o',
                    default: @@config.create.output_path
      method_option 'jsurl', type: :string, desc: 'TVJS client URL',
                    default: @@config.create.tvjs_client_url
      method_option 'jspath', type: :string, desc: 'TVJS application path',
                    default: @@config.create.tvjs_app_path
      method_option 'apiurl', type: :string, desc: 'Web API URL',
                    default: @@config.create.web_api_url
      def create(channel_id)
        # Get the channel info from Web API using channel ID.
        all_channels_url = URI.escape("#{@@config.api_url}admin").to_s
        puts "--- Requesting GET #{all_channels_url}...".yellow
        all_channels_response = RestClient.get(all_channels_url)
        all_channels = JSON.parse(all_channels_response.body)
        if (channel_index = all_channels.index { |c| c['_id'] == channel_id }).nil?
          raise ArgumentError.new("--- Channel with ID #{channel_id} is not found in response to GET #{all_channels_url}!")
        end
        channel = all_channels[channel_index]
        ap channel

        # Create content of manifest file from Web API response and provided options.
        puts "--- Found a channel with ID #{channel_id}. Generating a manifest...".yellow
        manifest_content = Chan.create_manifest(
          :author_id => channel['userId'],
          :channel_id => channel['_id'],
          :channel_name => channel['name'],
          :channel_desc => channel['description'],
          :tvjs_client_url => options[:jsurl],
          :tvjs_app_path => options[:jspath],
          :web_api_url => options[:apiurl]
        )

        # Request images and save them in memory.
        # TODO: Use more general approach here (consider layered icons).
        assets_urls = OpenStruct.new(
          :icon_small => URI.escape(channel['assets_icon_small'] || "placehold.it/#{@@config.icon_small_size}").to_s,
          :icon_large => URI.escape(channel['assets_icon_big'] || "placehold.it/#{@@config.icon_large_size}").to_s,
          :icon_topshelf => URI.escape(channel['assets_banner'] || "placehold.it/#{@@config.icon_topshelf_size}").to_s
        )

        puts "--- Requesting small icon GET #{assets_urls.icon_small}...".yellow
        icon_small_response = RestClient.get(assets_urls.icon_small, :accept => 'image/*')
        icon_small = OpenStruct.new(
          :content => icon_small_response.body,
          :basename => @@config.icon_small_basename,
          :size => @@config.icon_small_size
        )

        puts "--- Requesting large icon GET #{assets_urls.icon_large}...".yellow
        icon_large_response = RestClient.get(assets_urls.icon_large, :accept => 'image/*')
        icon_large = OpenStruct.new(
          :content => icon_large_response.body,
          :basename => @@config.icon_large_basename,
          :size => @@config.icon_large_size
        )

        puts "--- Requesting top shelf icon GET #{assets_urls.icon_topshelf}...".yellow
        icon_topshelf_response = RestClient.get(assets_urls.icon_topshelf, :accept => 'image/*')
        icon_topshelf = OpenStruct.new(
          :content => icon_topshelf_response.body,
          :basename => @@config.icon_topshelf_basename,
          :size => @@config.icon_topshelf_size
        )

        # Form the path for the recipe. If filename is not presented in the path parameter,
        # use name of the channel without spaces as filename.
        recipe_filename = channel['name'].gsub(/\s+/, '')
        output_path = Pathname.new(options[:output]).expand_path
        output_path = output_path.join("#{recipe_filename}#{@@config.recipe_extname}") if output_path.directory?
        output_path = Utility.increment_path(output_path) if output_path.exist?
        puts "--- Saving the recipe to #{output_path}...".yellow

        # Use temp directory to create an archive.
        Dir.mktmpdir do |path|
          temp_path = Pathname.new(path).expand_path
          assets_path = temp_path.join(@@config.assets_dirname)
          manifest_path = temp_path.join(@@config.manifest_basename)

          # Create recipe folder and save the manifest.
          FileUtils.mkpath(temp_path)
          FileUtils.mkpath(assets_path)
          File.write(manifest_path, manifest_content)

          # Save icons and format with ImageMagick.
          [icon_small, icon_large, icon_topshelf].each do |icon|
            icon.path = assets_path.join(icon.basename)
            File.write(icon.path, icon.content)
            MiniMagick::Tool::Convert.new do |convert|
              convert << icon.path
              convert << '-resize' << "#{icon.size}^"
              convert << '-gravity' << 'center'
              convert << '-extent' << icon.size
              convert << icon.path
            end
          end

          # Create zip archive with manifest and assets - the recipe.
          Zip::Archive.open(output_path.to_s, Zip::CREATE | Zip::TRUNC) do |ar|
            Dir.glob(temp_path.join('**/*').to_s).each do |p|
              absolute_path = Pathname.new(p).expand_path
              relative_path = absolute_path.relative_path_from(temp_path)
              if absolute_path.directory?
                ar.add_dir(relative_path.to_s)
              else
                ar.add_file(relative_path.to_s, absolute_path.to_s)
              end
            end
          end
        end

        puts "--- Done!".green
        exit 0
      end

      desc 'generate <recipe_path>',
           'Generates Xcode project from channel recipe.'
      method_option 'output', type: :string, desc: 'Output path', aliases: '-o',
                    default: @@config.generate.output_path
      method_option 'project', type: :string, desc: 'Channel project path', aliases: '-p',
                    default: @@config.generate.channel_project_path
      def generate(recipe_path)
        recipe_path = Pathname.new(recipe_path).expand_path

        # Create temp directory.
        Dir.mktmpdir do |path|
          temp_path = Pathname.new(path).expand_path
          manifest_path = temp_path.join(@@config.manifest_basename)
          puts "--- Unpacking the recipe #{recipe_path} to temp directory #{temp_path}...".yellow

          # Unzip recipe into temp directory.
          Zip::Archive.open(recipe_path.to_s) do |ar|
            ar.each do |zf|
              zf_path = temp_path.join(zf.name)
              if zf.directory?
                FileUtils.mkpath(zf_path)
              else
                FileUtils.mkpath(zf_path.dirname) unless zf_path.dirname.exist?
                File.write(zf_path, zf.read)
              end
            end
          end

          # Throw an error if there is no manifest in the archive.
          if !manifest_path.exist?
            raise ArgumentError.new("--- Manifest file `#{@@config.manifest_basename}` is missing in the recipe!")
          end

          # Read the manifest.
          puts "--- Found a manifest `#{@@config.manifest_basename}`. Reading the manifest...".yellow
          manifest = Plist::parse_xml(manifest_path)
          channel_properties = manifest['Channel Properties']
          channel_id, tvjs_client_url, tvjs_app_path, web_api_url =
            channel_properties.values_at('ID', 'TVJS Client URL', 'TVJS App Path', 'Web API URL')
          ap manifest

          # Copy Channel project to the output directory.
          channel_project_name = @@config.generate.channel_project_name
          channel_project_path = Pathname.new(options[:project]).expand_path
          channel_project_files = Dir.glob(channel_project_path.join("#{channel_project_name}*"))
          product_name = manifest['Channel Properties']['Name']
          project_name = product_name.gsub(/\s+/, '')
          project_path = Pathname.new(options[:output]).expand_path.join(project_name)
          project_path = Utility.increment_path(project_path) if project_path.exist?
          project_assets_path = project_path.join(project_name).join(@@config.generate.channel_project_assets_path)
          project_package_path = project_path.join("#{channel_project_name}.xcodeproj")
          puts "--- Copying Channel project from #{channel_project_path} to #{project_path}...".yellow

          # Throw an error if Channel project doesn't exist at the given path.
          if channel_project_files.grep(/#{channel_project_name}\.xcodeproj$/).empty?
            raise StandardError.new("--- Channel project `#{channel_project_name}.xcodeproj` is not found at #{channel_project_path}")
          end

          FileUtils.mkpath(project_path)
          FileUtils.cp_r(channel_project_files, project_path)

          # Remove user data from new project.
          puts "--- Removing user data from .xcodeproj...".yellow
          Dir.glob(project_path.join("#{channel_project_name}.xcodeproj/**/xcuserdata"))
                               .map(&project_package_path.method(:join))
                               .each(&FileUtils.method(:rmtree))

          # Replace all occurences of Channel project name with new project name in project files.
          puts "--- Renaming project from `#{channel_project_name}` to `#{project_name}`...".yellow
          replace_regex = /\b#{channel_project_name}\b/
          project_paths = Dir.glob(project_path.join(@@config.generate.project_files_to_rename_pattern))
                             .map(&Pathname.method(:new))
          Utility.files_replace(project_paths, replace_regex, project_name)

          # Change project settings.
          puts "--- Updating project settings with manifest values...".yellow
          project = Xcodeproj::Project.open(project_package_path)

          debug_settings = project.build_configuration_list['Debug'].build_settings
          release_settings = project.build_configuration_list['Release'].build_settings
          debug_staging_settings = project.build_configuration_list['Debug Staging'].build_settings
          release_staging_settings = project.build_configuration_list['Release Staging'].build_settings
          development_project_settings = {
            'CL_CHANNEL_ID' => channel_id,
            'CL_TVJS_CLIENT_URL' => @@config.project_settings.local_client_url,
            'CL_TVJS_APP_PATH' => tvjs_app_path,
            'CL_WEB_API_URL' => web_api_url
          }
          staging_project_settings = development_project_settings.merge({
            'CL_TVJS_CLIENT_URL' => tvjs_client_url
          })

          debug_settings.merge!(development_project_settings)
          release_settings.merge!(development_project_settings)
          debug_staging_settings.merge!(staging_project_settings)
          release_staging_settings.merge!(staging_project_settings)

          product = project.products[0]
          target = project.targets[0]
          target.name = target.product_name = product.name = product_name
          product.path = "#{product_name}.app"

          project.save

          # Rename project files.
          rename_regex = /#{channel_project_name}/
          Utility.rename_recursive(project_path, rename_regex, project_name)

          # Setup project icons.
          puts "--- Setting up app icons...".yellow
          manifest['Assets']['App Icons'].each do |key, value|
            # Single icon.
            if value.is_a? String
              icon_path = temp_path.join(value)
              project_icon_path = project_assets_path.join("#{key}.imageset/#{File.basename(value)}")
              FileUtils.cp(icon_path, project_icon_path)
            end

            # Layered icon.
            if value.is_a? Hash
              value.each do |layer, icon|
                icon_path = temp_path.join(icon)
                project_icon_path = project_assets_path.join(
                  "#{key}.imagestack/#{layer}.imagestacklayer/Content.imageset/#{File.basename(icon)}")
                FileUtils.cp(icon_path, project_icon_path)
              end
            end
          end
        end

        puts "--- Done!".green
        exit 0
      end

      desc 'import <channel_id>',
           'Imports missing or broken videos for a channel to Amazon S3 storage.'
      method_option 'aws-bucket', type: :string, desc: 'AWS S3 bucket name', aliases: '-b',
                    default: @@config.import.aws_bucket
      method_option 'aws-access-key-id', type: :string, desc: 'AWS access key ID', aliases: '-i',
                    default: @@config.import.aws_access_key_id
      method_option 'aws-secret-access-key', type: :string, desc: 'AWS secret access key', aliases: '-s',
                    default: @@config.import.aws_secret_access_key
      method_option 'aws-region', type: :string, desc: 'AWS region', aliases: '-r',
                    default: @@config.import.aws_region
      def import(channel_id)
        # Configure AWS.
        aws_bucket = options['aws-bucket']
        aws_region = options['aws-region']
        puts "--- Using Amazon S3 bucket #{aws_bucket} in #{aws_region} region.".yellow
        Aws.config.update({
          region: aws_region,
          credentials: Aws::Credentials.new(
            options['aws-access-key-id'],
            options['aws-secret-access-key']
          )
        })

        # Get the videos array for the channel from Web API using channel ID.
        get_channel_videos_url = URI.escape("#{@@config.api_url}channels/#{channel_id}").to_s
        puts "--- Requesting GET #{get_channel_videos_url}...".yellow
        channel_videos_response = RestClient.get(get_channel_videos_url)
        channel_videos = JSON.parse(channel_videos_response.body)

        s3 = Aws::S3::Client.new
        updated_videos = []
        channel_videos.each do |video|
          begin
            video_id = video['_id']
            video_import_id = video['importId']
            video_path = Chan.get_youtube_video_temp_path(video_import_id)
            aws_key = "#{channel_id}/#{video_path.basename}".strip
            s3_video_url = "https://s3-#{aws_region}.amazonaws.com/#{aws_bucket}/#{aws_key}"
            video_url = video['video']
            has_no_url = video_url.nil? || video_url.empty?
            video_url ||= s3_video_url

            puts("--- Video #{video_id} has no URL! Assuming it is #{s3_video_url}.".red) if has_no_url
            puts "--- Validating video #{video_id} with URL #{video_url}...".yellow
            Utility.test_resource(video_url) do |res|
              if res.exist? && !has_no_url
                puts "--- Video #{video_id} is OK!".green
              elsif res.exist? && has_no_url
                puts "--- Video #{video_id} is OK! But the URL must be updated in the database.".green
              else
                puts "--- Video #{video_id} is missing or broken: #{res.error.message}!".red
                puts "--- Downloading video #{video_id} with 'youtube-dl'...".yellow
                video_path = Chan.download_youtube_video(video_import_id)
                raise StandardError.new("'youtube-dl' failed to download the video!") if video_path.nil?
                puts "--- Uploading video #{video_id} to Amazon S3 bucket #{aws_bucket} with key #{aws_key}".yellow

                # Upload S3 object.
                s3.put_object(
                  :bucket => aws_bucket,
                  :key => aws_key,
                  :body => File.read(video_path)
                )

                # Set public read access for the S3 object.
                s3.put_object_acl(
                  :bucket => aws_bucket,
                  :key => aws_key,
                  :acl => 'public-read'
                )

                # Get new URL for the video and prepare the video for DB update.
                puts "--- Uploaded video #{video_id} to Amazon S3: #{video_url}.".yellow
              end

              updated_videos << {
                '_id' => video_id,
                'video' => video_url
              } if !res.exist? || has_no_url
            end
          rescue => e
            puts "--- Something went wrong while processing video #{video_id}: #{e.message}".red
          end
        end

        # Update videos in the DB.
        unless updated_videos.empty?
          put_channel_videos_url = URI.escape("#{@@config.api_url}channels/#{channel_id}/videos").to_s
          puts "--- Requesting PUT #{put_channel_videos_url} with data:".yellow
          ap updated_videos
          RestClient.put(
            put_channel_videos_url,
            JSON.unparse(updated_videos),
            :content_type => 'application/json'
          )
        else
          puts '--- There are no any missing or broken videos!'.green
        end

        puts "--- Done!".green
        exit 0
      end
    end
  end
end
