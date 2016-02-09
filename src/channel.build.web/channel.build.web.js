Router.route('/', function () {
  this.render('home');
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

  Template.home.helpers({
    currentUser: function() {
      return Meteor.user();
    }
  });
}

if (Meteor.isServer) {
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
}
