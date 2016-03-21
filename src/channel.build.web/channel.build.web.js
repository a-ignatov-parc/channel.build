Router.route('/', {
  action: function () {
    this.render('home');
  },
  waitOn: function() {
    Accounts.loginServicesConfigured();
  }
});

if (Meteor.isClient) {
  Template.googleLogin.events({
    'click': function(event, template){
      Meteor.loginWithGoogle({
        requestPermissions: ['email']
      }, function (err) {
        if (err) alert('error : ' + err.message);
      });
    }
  });

  Meteor.subscribe('myInvites');

  Template.home.helpers({
    currentUser: function() {
      return Meteor.user();
    },
    userIsInvited: function () {
      if (!Meteor.user()) return false;

      var myInvite = Invites.findOne();
      return myInvite && myInvite.invited;
    }
  });

  Template.mainMenu.events({
    'click div': function () {
      Session.set('showMenu', !Session.get('showMenu'));
    }
  });

  Template.mainMenu.helpers({
    showMenuContent: function() {
      return Session.get('showMenu');
    }
  });

  Template.notInvited.events({
    'click .not-invited-wrapper, .click not-invited-block': function () {
      document.cookie = "noInviteOnce=true";
      Session.set('hideNoInvite', true);
    }
  });

  Template.notInvited.helpers({
    hideNoInviteContent: function() {
      if (Session.get('hideNoInvite'))
        return true;

      if (document.cookie.match("noInviteOnce="))
        return true;

      return false;
    }
  });
}

if (Meteor.isServer) {
  // Set body-parser npm package as a middleware for picker.
  var bodyParser = Meteor.npmRequire('body-parser');
  Picker.middleware(bodyParser.json());
  Picker.middleware(bodyParser.urlencoded({ extended: false }));

  Meteor.startup(function () {
  });

  ServiceConfiguration.configurations.remove({
    service: "google"
  });
  ServiceConfiguration.configurations.insert({
    service: "google",
    clientId: "578510381054-1ihsp36ih3fmfrtg629pcok47fa9nh4d.apps.googleusercontent.com",
    secret: "N5P4tjO5Z2akK_c1XlCZOU2X"
  });

  Picker.route("/api/channels/:_id/", function(params, req, res) {
      var videos = Videos.find({
        appId: params._id,
        selected: true
      }).fetch();

      res.end(JSON.stringify(videos));
  });

  Picker.route("/api/channels/:_id/videos", function (params, req, res) {
    switch (req.method) {
    case "PUT":
      // Body is an array of videos with fields to update.
      // Make a bulk update of videos.
      var bulk = Videos.rawCollection().initializeUnorderedBulkOp();
      req.body.forEach(function (video) {
        bulk.find({ appId: params._id, _id: video._id })
            .update({ $set: video });
      });
      bulk.execute(function () {});
      break;
    }
    res.end();
  });

  Picker.route("/api/analytics/channels/:_id", function (params, req, res) {
    switch (req.method) {
    case "POST":
      var appId = params._id,
          analytic = req.body,
          appExists = !!Apps.findOne(appId);
      analytic.appId = appId;
      if (appExists) { Analytics.insert(analytic); }
      break;
    }
    res.end();
  });

  Picker.route("/api/admin/", function(params, req, res) {
    var apps = Apps.find().fetch();

    res.end(JSON.stringify(apps));
  });

  Accounts.onLogin(function(user){
    var myInvite = Invites.findOne({'userId': user.user._id});
    if (myInvite) {
      if (myInvite.developer == undefined) {
        Invites.update(myInvite._id, {
          'userId': user.user._id,
          'invited': myInvite.invited,
          'developer': false
        });
      }
    }
    else {
      Invites.insert({
        'userId': user.user._id,
        'invited': false,
        'developer': false
      });
    }
  });

  Accounts.onCreateUser(function (options, user) {
    if (options.profile) {
      user.profile = options.profile;
      user.profile.givenName = user.services.google.given_name;
      user.profile.userName = user.services.google.email.split('@')[0]
    }

    return user;
  });
}
