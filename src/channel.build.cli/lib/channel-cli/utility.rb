module CaffeineLabs
  module ChannelCli
    module Utility
      # NOTE: http://stackoverflow.com/a/30225093/1211780
      def self.deep_merge(a, b)
          merger = proc { |key, v1, v2| Hash === v1 && Hash === v2 ? v1.merge(v2, &merger) : Array === v1 && Array === v2 ? v1 | v2 : [:undefined, nil, :nil].include?(v2) ? v1 : v2 }
          a.merge(b.to_h, &merger)
      end

      # NOTE: http://stackoverflow.com/a/3450848/1211780
      def self.compact(h)
        compacter = proc { |k, v| v.kind_of?(Hash) ? (v.delete_if(&compacter); nil) : v.nil? }
        h.delete_if(&compacter)
      end

      def self.files_replace(file_paths, regex, substitute)
        file_paths.select(&:file?).each do |path|
          content = File.read(path).gsub(regex, substitute)
          File.write(path, content.force_encoding('UTF-8'))
        end
      end

      def self.rename_recursive(path, regex, substitute)
        basename = path.basename.to_s.gsub(regex, substitute)
        new_path = path.dirname.join(basename)
        FileUtils.mv(path.to_s, new_path.to_s) if path != new_path
        if new_path.directory?
          Dir.glob("#{new_path}/*").each { |p| rename_recursive(Pathname.new(p), regex, substitute) }
        end
      end

      def self.increment_path(path)
        n = 1
        new_path = path
        while new_path.exist? do
          new_path = path.file? ? path.parent.join("#{path.basename(path.extname)}_#{n}#{path.extname}") :
                                  path.parent.join("#{path.basename}_#{n}")
          n += 1
        end
        new_path
      end
    end
  end
end
