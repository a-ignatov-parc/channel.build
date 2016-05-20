/**
 * Base class for workers.
 * Establishes a DDP connection to the server with login and password
 * provided by $WORKER_ACCOUNT and $WORKER_PASS environment variables.
 * Uses 'host' and 'port' constructor parameters for DPP connection to the server.
 */

(function () {
  'use strict';

  var DDP = require('ddp'),
      DDPLogin = require('ddp-login'),
      Job = require('meteor-job');

  var JobsWorker = function (host, port) {
    // Setup the DDP connection.
    var _account = process.env.WORKER_ACCOUNT,
        _pass = process.env.WORKER_PASS,
        _ddp = new DDP({
          host: host,
          port: port,
          use_ejson: true
        });

    // Connect Job with this DDP session.
    Job.setDDP(_ddp);

    this.connect = function (startWorkers) {
      startWorkers = typeof startWorkers === 'function' ? startWorkers : function () {};
      // Open the DDP connection.
      _ddp.connect(function (err) {
        if (err) throw err;
        // Login to Meteor app and start workers to process jobs queue.
        DDPLogin(_ddp, {
          account: _account,
          pass: _pass
        }, function (err, token) {
          if (err) throw err;
          console.log(`Logged in to ${host}:${port} as ${_account}. Starting workers...`);
          startWorkers();
        });
      });
    };
  };

  module.exports = JobsWorker;
})();
