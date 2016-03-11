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

      def self.download_youtube_video(video_id)
        # youtube-dl -ciw --restrict-filenames -o \%\(title\)s-\%\(id\)s.\%\(ext\)s https://www.youtube.com/watch\?v\=woNBwkaL18M
        path = nil
        command = "#{@@config.import.youtube_dl_command} https://www.youtube.com/watch\?v\=#{video_id}"
        puts command.gsub('\\', '').cyan
        IO.popen(command).each_line do |line|
          puts line.strip.blue
          path ||= line[/\[download\].*(#{Dir.tmpdir}.*\.mp4).*/, 1]
        end
        path.nil? ? nil : Pathname.new(path)
      end
    end
  end
end
