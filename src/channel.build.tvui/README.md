# channel.build.tvui

TVML/TVJS part of the Client-Server tvOS app for Channel.

## Installation

    $ npm install

## Usage

Use this code together with tvOS app. To make sure that Meteor app hosts TVML/TVJS files set `$TVOS_CLIENT_PATH` environment variable
to this project's root directory. Run Meteor app and navigate to `localhost:3000/tvos/v1/tvjs/app.js`.
This should response with `dist/app.js` from this project's root directory which has been built with `$ npm install` command.
For remote deployment of TVML/TVJS files use [this script](https://github.com/caffeinelabs/channel.build/blob/master/scripts/deploy-client.sh).

## Configuration

You can configure build process in `webpack.config.js`. Some of the app settings available at `js/settings.js`.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/caffeinelabs/channel.build.
