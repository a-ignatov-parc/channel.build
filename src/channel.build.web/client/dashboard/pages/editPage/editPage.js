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
  category: function() {
    return Apps.findOne().category;
  },
  error: function () {
    return Session.get('error');
  },
  appId: function () {
    return appId;
  },
  categories: function () {
    return [
      "None",
      "Books",
      "Business",
      "Catalogs",
      "Education",
      "Entertainment",
      "Finance",
      "Food & Drink",
      "Games",
      "Health & Fitness",
      "Lifestyle",
      "Magazines & Newspapers",
      "Medical",
      "Music",
      "Navigation",
      "News",
      "Photo &amp; Video",
      "Productivity",
      "Reference",
      "Shopping",
      "Social Networking",
      "Sports",
      "Travel",
      "Utilities",
      "Weather"
    ];
  }
});

Template.editPage.helpers({
  equals: function (a, b) {
    return a === b;
  }
});

Template.editPage.created = function() {
  var usersApp = Apps.findOne();
  if(!usersApp) {
    Apps.insert({
      'userId': Meteor.userId(),
      'name': '',
      'category': '',
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
