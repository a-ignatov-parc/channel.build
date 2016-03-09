# CaffeineLabs::ChannelCli

CLI for managing applications created by users of Channel app. See more info here: http://channel.build/.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'channel-cli'
```

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install channel-cli

## Usage

```shell
$ sudo gem install bundler
$ bundle install
$ ./chan help create
$ ./chan help generate
$ ./chan create Wok55EFCerwSna5PR # outputs ./MachineLearning.chr
$ ./chan generate MachineLearning.chr # outputs Xcode project in ./MachineLearning
```

## Configuration

The following environment variables allow to setup CLI behavior:
- `CHAN_API_URL` - Channel Web API URL. Default is `http://channel.build/api/`.
- `CHAN_PROJECT_DIR` - Channel tvOS project directory. Default is `$HOME/Projects/channel.build/src/channel.build.tvos`.

## Development

After checking out the repo, run `bin/setup` to install dependencies. Then, run `rake spec` to run the tests. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

To install this gem onto your local machine, run `bundle exec rake install`. To release a new version, update the version number in `version.rb`, and then run `bundle exec rake release`, which will create a git tag for the version, push git commits and tags, and push the `.gem` file to [rubygems.org](https://rubygems.org).

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/caffeinelabs/channel.build.
