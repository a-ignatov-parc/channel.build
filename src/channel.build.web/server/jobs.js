// TODO: Move workers code to a separate node.
//       Docs: https://atmospherejs.com/vsivsi/job-collection.
// TODO: Use more robust logging solution.
var fs = Meteor.npmRequire('fs'),
    os = Meteor.npmRequire('os');

// TODO: The issue is that workers fail to run because they have no access to the opened file...
// var logsPath = `${process.env.HOME}/log/channel.build`;
// shell.mkdir('-p', logsPath);
// var chanJobsLogStream = fs.createWriteStream(`${logsPath}/chan.log`);
// ChanJobs.setLogStream(chanJobsLogStream);
ChanJobs.setLogStream(process.stdout);

ChanJobs.allow({
  admin: function (userId, method, params) {
    return (userId ? true : false);
  }
});

Meteor.startup(function () {
  ChanJobs.startJobServer();
  // Example:
  // Job(ChanJobs, 'import', { channelId: 'cXYen6PdzBnoEPGqK' }).save();
});
