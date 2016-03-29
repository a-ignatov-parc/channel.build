Template.editPage.helpers({
  name: function() {
    var app =  Apps.findOne()
    return app ? app.name : "";
  },
  description: function() {
    var app =  Apps.findOne()
    return app ? Apps.findOne().description : "";
  },
  category: function() {
    var app =  Apps.findOne()
    return app ? Apps.findOne().category : "";
  },
  keywords: function() {
    var app = Apps.findOne()
    return app ? Apps.findOne().keywords : "";
  },
  copyright: function() {
    var app = Apps.findOne()
    return app ? Apps.findOne().copyright : "";
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
