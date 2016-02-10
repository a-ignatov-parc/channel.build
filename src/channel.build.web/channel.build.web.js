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

  Picker.route("/api/channels/:_id/videos/", function(params, req, res) {
    var base = "https://s3-us-west-2.amazonaws.com/channel.build.oregon/gwces2016/"
    res.end(JSON.stringify({
      videos: [
        base + "Team+GeekWire+arrives+at+CES+2016-woNBwkaL18M.mp4",
        base + "CES+2016+-+Day+1+recap-opjNvc38Xcc.mp4",
        base + "CES+2016+Day+2+recap-6eFy9oYSj94.mp4",
        base + "Jai+Ho+performance+at+Intel+press+conference+CES+2016-bhFUe78bnoQ.mp4",
        base + "Microsoft's+epic+CES+party+in+Las+Vegas+with+Steve+Aoki-FAjpXtzB4KA.mp4",
        base + "Shaquille+O'Neal+interview+at+CES+2016-D8h4LcSk7R.mp4",
        base + "Kenny+Smith+interview+at+CES+2016-S7WFb-jCzUk.mp4",
        base + "Charles+Barkley+interview+at+CES+2016-IEQnpny9kIE.mp4",
        base + "Kia+VR+experience+in+self-driving+Soul+EV+hatchback-GewwoTOjjdE.mp4"
      ]
    }));
  });
}
