var appId = null;

Template.app.events({
  'submit form': function(event) {
    event.preventDefault();

    var appInfo = {
      userId: Meteor.userId(),
      name: event.target.name.value,
      description: event.target.description.value
    };

    Apps.update(appId, appInfo);
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
