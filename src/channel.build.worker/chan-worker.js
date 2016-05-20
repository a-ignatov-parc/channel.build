/**
 * Worker for Channel CLI jobs.
 * Passes 'host' and 'port' parameters to the base class constructor using $WORKER_HOST and
 * $WORKER_PORT environment variables respectively.
 */

(function () {
  'use strict';

  var Job = require('meteor-job'),
      JobsWorker = require('./jobs-worker'),
      Shell = require('shelljs');

  /**
   * Runs 'chan import' command for apps to download videos to Amazon S3 storage and update the database.
   */
  var chanWorker = new JobsWorker(process.env.WORKER_HOST, process.env.WORKER_PORT);
  chanWorker.connect(function () {
    return Job.processJobs('chan', 'import', {
        concurrency: 1
      }, function (job, callback) {
        console.log(`[${new Date()}] Processing job with ID ${job._doc._id} and Run ID ${job._doc.runId}...`);
        var chan = process.env.CHAN_PATH,
            channelId = job.data.channelId,
            command = `${chan} import ${channelId}`,
            res = Shell.exec(command);

        job.log(`output: ${res.output}`);
        if (res.code === 0) { job.done(); } else { job.fail(); }
        callback();
      });
  });
})();
