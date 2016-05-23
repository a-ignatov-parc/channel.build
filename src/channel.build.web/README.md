# channel.build.web

Meteor app for the Channel website: http://channel.build/.

## Installation

You need to install Meteor in order to run this app.

    $ curl https://install.meteor.com | /bin/sh

## Usage

Configure `settings.local.json` and run with these settings:

    $ meteor --settings settings.local.json

## Configuration

Copy `settings.json` to local file and fill out `settings.local.json` with your keys and other settings:

    $ cp settings.json settings.local.json

To make sure that Meteor app hosts [TVML/TVJS files](https://github.com/caffeinelabs/channel.build/tree/master/src/channel.build.tvui)
set `$TVOS_CLIENT_PATH` environment variable to TVML/TVJS project's root directory.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/caffeinelabs/channel.build.
