# channel.build.tvos

Xcode project template which is used to generate channel apps for users.

## Usage

Simply build and run the project in Xcode v7.3 or higher.

## Configuration

There are two build schemes for the project: `channel` for development environment and `channelStaging` for staging environment.
You may edit these settings in Project Settings > Build Settings > User-Defined. All Channel-related settings keys are prefixed with `CL_`.
These keys are used in `Info.plist` settings file and then parsed in `Config.swift` for in-app usage.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/caffeinelabs/channel.build.
