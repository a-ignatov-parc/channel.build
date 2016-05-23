# channel.build.worker

Background jobs worker for Channel Meteor app. It is a stand-alone Node.js app which establishes DDP connection to Meteor app
and processes background jobs from it. See [vsivsi/meteor-job-collection](https://github.com/vsivsi/meteor-job-collection) for more info.

## Installation

    $ npm install

## Usage

    # run whatever worker you need
    $ node chan-worker.js

Or you can setup and run it with [pm2](http://pm2.keymetrics.io/).
[This script](https://github.com/caffeinelabs/channel.build/blob/master/scripts/deploy-worker.sh)
uses pm2 to deploy the worker app to remote server.

## Configuration

The following environment variables allow to setup CLI behavior:
- `WORKER_ACCOUNT` - account name of Meteor app for worker.
- `WORKER_PASS` - password for worker's Meteor account.
- `WORKER_HOST` - host of Meteor app.
- `WORKER_PORT` - port of Meteor app.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/caffeinelabs/channel.build.
