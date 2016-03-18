module CaffeineLabs
  module ChannelCli
    class Chan < Thor
      def self.create_manifest(options = {})
        manifest_properties = {
          'Author Properties' => {
            'ID'              => options.fetch(:author_id)
          },
          'Channel Properties' => {
            'ID'              => options.fetch(:channel_id),
            'Name'            => options.fetch(:channel_name),
            'Description'     => options.fetch(:channel_desc),
            'TVJS Client URL' => options.fetch(:tvjs_client_url),
            'TVJS App Path'   => options.fetch(:tvjs_app_path),
            'Web API URL'     => options.fetch(:web_api_url)
          },
          'Assets' => {
            'App Icons' => {
              'App Icon - Small' => {
                'Back'   => "#{@@config.assets_dirname}/#{@@config.icon_small_basename}",
                'Middle' => "#{@@config.assets_dirname}/#{@@config.icon_small_basename}",
                'Front'  => "#{@@config.assets_dirname}/#{@@config.icon_small_basename}"
              },
              'App Icon - Large' => {
                'Back'   => "#{@@config.assets_dirname}/#{@@config.icon_large_basename}",
                'Middle' => "#{@@config.assets_dirname}/#{@@config.icon_large_basename}",
                'Front'  => "#{@@config.assets_dirname}/#{@@config.icon_large_basename}"
              },
              'Top Shelf Image' => "#{@@config.assets_dirname}/#{@@config.icon_topshelf_basename}"
            }
          }
        }

        Utility.deep_merge(
          @@config.manifest_properties,
          Utility.compact(manifest_properties)
        ).to_plist
      end

      def self.get_youtube_video_temp_path(video_id)
        Pathname.new(`#{@@config.import.simulate_youtube_dl_command} #{@@config.import.youtube_video_url}#{video_id}`.strip)
      end

      def self.get_youtube_video_temp_path_as_mp4(video_id)
        video_path = self.get_youtube_video_temp_path(video_id)
        video_path.dirname.join("#{video_path.basename('.*')}.mp4")
      end

      def self.download_youtube_video_as_mp4(video_id)
        # youtube-dl -ciw --restrict-filenames -o \%\(title\)s-\%\(id\)s.\%\(ext\)s https://www.youtube.com/watch\?v\=woNBwkaL18M
        path = nil
        command = "#{@@config.import.youtube_dl_command} #{@@config.import.youtube_video_url}#{video_id}"
        puts command.cyan
        IO.popen(command).each_line do |line|
          puts line.strip.blue
          path ||= line[/\[ffmpeg\].*(#{Dir.tmpdir}.*\.[^\s\"]+)\"?.*/, 1]
        end
        path.nil? ? nil : Pathname.new(path)
      end
    end
  end
end
