# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'channel-cli/version'

Gem::Specification.new do |s|
  s.name          = 'channel-cli'
  s.version       = CaffeineLabs::ChannelCli::VERSION
  s.platform      = Gem::Platform::CURRENT
  s.authors       = ['Michael Kalygin']
  s.email         = ['michael.kalygin@gmail.com']
  s.licenses      = ['AGPLv3']

  s.summary       = 'Automate apps creation for the Channel app.'
  s.description   = 'CLI for managing applications created by users of the Channel app.'
  s.homepage      = 'http://channel.build'

  # Prevent pushing this gem to RubyGems.org by setting 'allowed_push_host'.
  if s.respond_to?(:metadata)
    s.metadata['allowed_push_host'] = "TODO: Set to 'http://mygemserver.com'"
  else
    raise 'RubyGems 2.0 or newer is required to protect against public gem pushes.'
  end

  s.files         = Dir.glob('{lib/**/*,bin/*}').select(&File.method(:file?))
  s.test_files    = Dir.glob('spec/**/*').select(&File.method(:file?))
  s.bindir        = 'bin'
  s.executables   = %w(chan)
  s.require_paths = %w(lib)

  s.add_dependency 'thor',            '~>0.19'
  s.add_dependency 'xcodeproj',       '~>0.28'
  s.add_dependency 'zipruby',         '~>0.3'
  s.add_dependency 'plist',           '~>3.2'
  s.add_dependency 'rest-client',     '~>1.8'
  s.add_dependency 'colorize',        '~>0.7'
  s.add_dependency 'awesome_print',   '~>1.6'
  s.add_dependency 'mini_magick',     '~>4.4'
  s.add_dependency 'streamio-ffmpeg', '~>2.0'
  s.add_dependency 'aws-sdk',         '~>2'

  s.add_development_dependency 'bundler',    '~>1.11'
  s.add_development_dependency 'rake',       '~>10.0'
  s.add_development_dependency 'rspec',      '~>3.0'
  s.add_development_dependency 'pry',        '~>0.10'
  s.add_development_dependency 'pry-byebug', '~>3.3'
end
