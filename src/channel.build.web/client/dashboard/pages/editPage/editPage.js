Meteor.subscribe('myApp');

Template.editPage.helpers({
  userName: function() {
    return Meteor.user() ? Meteor.user().profile.givenName : "";
  },
  name: function() {
    return Apps.findOne().name;
  },
  description: function() {
    return Apps.findOne().description;
  },
  error: function () {
    return Session.get('error');
  },
  appId: function () {
    return appId;
  }
});

Template.editPage.created = function() {
  var usersApp = Apps.findOne();
  if(!usersApp) {
    Apps.insert({
      'userId': Meteor.userId(),
      'name': '',
      'description': ''
    });
  }
};

Template.editPage.events({
  'change form': function(event) {
    var appInfo = {};
    appInfo[event.target.name] = event.target.value

    var usersApp = Apps.findOne();
    Apps.update(usersApp._id, {
      $set: appInfo
    });
  }
});
