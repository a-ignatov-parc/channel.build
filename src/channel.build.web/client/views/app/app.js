var appId = null;

Template.app.events({
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

Template.app.helpers({
  create: function(){

  },
  rendered: function(){

  },
  destroyed: function(){

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
  }
});

Meteor.subscribe('myApp');

Template.app.created = function() {
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
}
