Meteor.publish('analytics', function (appId) {
  return Analytics.find({ appId: appId });
});
