// TODO: Move workers code to a separate node.
//       Docs: https://atmospherejs.com/vsivsi/job-collection.
// TODO: Use more robust logging solution.
var fs = Meteor.npmRequire('fs'),
    os = Meteor.npmRequire('os');

var logsPath = `${process.env.HOME}/log/channel.build`;
shell.mkdir('-p', logsPath);
var chanJobsLogStream = fs.createWriteStream(`${logsPath}/chan.log`);
ChanJobs.setLogStream(chanJobsLogStream);

ChanJobs.allow({
  admin: function (userId, method, params) {
    return (userId ? true : false);
  }
});

ChanJobs.processJobs('import', {
    concurrency: os.cpus().length
  },
  function (job, callback) {
    var chan = process.env.CHAN_PATH,
        channelId = job.data.channelId,
        command = `${chan} import ${channelId}`;
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
