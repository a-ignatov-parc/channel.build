module CaffeineLabs
  module ChannelCli
    class Chan < Thor
      @@config = OpenStruct.new(
        :api_url => ENV['CHAN_API_URL'] || 'http://channel.build/api/',
        :manifest_basename => 'manifest.plist',
        :assets_dirname => 'assets',
        :recipe_extname => '.chr',
        :icon_small_basename => 'icon-small.png',
        :icon_large_basename => 'icon-large.png',
        :icon_topshelf_basename => 'icon-topshelf.png',
        :icon_small_size => '400x240',
        :icon_large_size => '1280x768',
        :icon_topshelf_size => '1920x720',

        :manifest_properties => {
          'Recipe Version' => '1.0',
          'Organization Name' => 'CaffeineLabs',
          'Organization Identifier' => 'com.caffeinelabs'
        },

        :project_settings => OpenStruct.new(
          :local_client_url => 'http://localhost:1337/'
        ),

        :create => OpenStruct.new(
          :output_path => Dir.getwd,
          :tvjs_client_url => 'http://channel-staging.heroku.com/',
          :tvjs_app_path => 'app.js',
          :web_api_url => 'http://channel.build/api/'
        ),

        :generate => OpenStruct.new(
          :output_path => Dir.getwd,
          :channel_project_path => ENV['CHAN_PROJECT_DIR'] || "#{ENV['HOME']}/Projects/channel.build/src/channel.build.tvos",
          :channel_project_name => 'channel',
          :project_files_to_rename_pattern => '**/{*.swift,*.plist,*.pbxproj,*.xcscheme,*.xcworkspacedata}',
          :channel_project_assets_path => 'Assets.xcassets/App Icon & Top Shelf Image.brandassets'
        ),

        :import => OpenStruct.new(
          :youtube_video_url => "https://www.youtube.com/watch\?v\=",
          :simulate_youtube_dl_command => "youtube-dl -s --get-filename -ciw --restrict-filenames --recode-video mp4 -o #{Dir.tmpdir}/%\\(title\\)s-%\\(id\\)s.%\\(ext\\)s",
          :youtube_dl_command => "youtube-dl -ciw --restrict-filenames --recode-video mp4 -o #{Dir.tmpdir}/%\\(title\\)s-%\\(id\\)s.%\\(ext\\)s",
          :aws_bucket => 'channel.build.oregon',
          :aws_region => ENV['AWS_REGION'] || 'us-west-2',
          :aws_access_key_id => ENV['AWS_ACCESS_KEY_ID'] || 'AKIAJQKIA6ZNWFCVVNEA',
          :aws_secret_access_key => ENV['AWS_SECRET_ACCESS_KEY'] || '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'
        )
      )

      def self.config
        @@config
      end
    end
  end
end
