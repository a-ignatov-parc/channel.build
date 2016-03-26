var appId = null;

Template.tvapp.events({
  'submit form': function(event) {
    event.preventDefault();

    var appInfo = {
      userId: Meteor.userId(),
      name: event.target.name.value,
      description: event.target.description.value
    };

    Apps.update(appId, {
      $set: appInfo
    });
  },
  "click #logout": function(event) {
    Meteor.logout(function() {

    });
  }
});

Template.tvapp.helpers({
  create: function(){

  },
  rendered: function(){

  },
  destroyed: function(){

  },
  userName: function() {
    return Meteor.user() ? Meteor.user().profile.givenName : "";
  },
  name: function() {
    return Apps.findOne().name;
  },
  description: function() {
    return Apps.findOne().description;
  },
  developer: function () {
    var myInvite = Invites.findOne();
    return myInvite && myInvite.developer;
  },
  error: function () {
    return Session.get('error');
  },
  appId: function () {
    return appId;
  }
});

Meteor.subscribe('myApp');
Meteor.subscribe('myVideos');

Template.tvapp.created = function() {
  var usersApp = Apps.findOne();
  if(usersApp) {
    appId = usersApp._id;
  }
  else {
    appId = Apps.insert({
      'userId': Meteor.userId(),
      'name': '',
      'description': ''
    });
  }
};
