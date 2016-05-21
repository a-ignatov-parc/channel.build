// TODO: Use more robust logging solution.
var fs = Meteor.npmRequire('fs'),
    os = Meteor.npmRequire('os');

ChanJobs.allow({
  admin: function (userId, method, params) {
    return (userId ? true : false);
  }
});

Meteor.startup(function () {
  // Start Channel CLI jobs server for DDP connections.
  // Connected workers will process incoming jobs.
  ChanJobs.startJobServer();
});
