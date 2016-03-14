// TODO: Move workers code to a separate node.
//       Docs: https://atmospherejs.com/vsivsi/job-collection.
ChanJobs = JobCollection('chan');
ChanJobs.setLogStream(process.stdout);

ChanJobs.processJobs('import',
  function (job, callback) {
    channelId = job.data.channelId;
    command = `chan import ${channelId}`;
    res = shell.exec(command);
    job.log(`output: ${res.output}`);
    if (res.code === 0) { job.done(); } else { job.fail(); }
    callback();
  }
);

Meteor.startup(function () {
  ChanJobs.startJobServer();
  // Example:
  // Job(ChanJobs, 'import', { channelId: 'cXYen6PdzBnoEPGqK' }).save();
});
