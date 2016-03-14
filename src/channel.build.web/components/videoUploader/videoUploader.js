if (Meteor.isClient) {
  var videoUploader = {};

  Template.videoUploader.created = function() {
    videoUploader = new Slingshot.Upload("videoUploader");
  };

  Template.videoUploader.destroyed = function() {
  };

  Template.videoUploader.helpers({
    progress: function () {
      return Math.round(videoUploader.progress() * 100);
    },
    url: function () {
      var usersApp = Apps.findOne();
      return usersApp[this.name];
    }
  });

  Template.videoUploader.events({
    "change input": function(event) {
      var this_ = this;
      videoUploader.send(event.target.files[0], function (error, downloadUrl) {
        if (error) {
          console.error('Error uploading', videoUploader.xhr.response);
          alert (error);
        }
        else {
          addVideos([
            {
              importType: 'youtube',
              importId: null,
              title: "",
              description: "",
              thumbnails: {
                	default: { url: null, width: 0, height: 0 },
                  medium: { url: null, width: 0, height: 0 },
                  high: { url: null, width: 0, height: 0 },
                  standard: { url: null, width: 0, height: 0 },
                  maxres: { url: null, width: 0, height: 0 },
              },
              video: downloadUrl
            }
          ], 'upload')
        }
      });
    }
  });
}

if (Meteor.isServer) {
  Slingshot.fileRestrictions("videoUploader", {
    allowedFileTypes: ["video/mp4"],
    maxSize: 10 * 1024 * 1024 * 1024 // 10 GB (use null for unlimited).
  });

  Slingshot.createDirective("videoUploader", Slingshot.S3Storage, {
    bucket: "channel.build.oregon",
    region: "us-west-2",
    acl: "public-read",
    AWSAccessKeyId: "AKIAJQKIA6ZNWFCVVNEA",
    AWSSecretAccessKey: "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",

    authorize: function () {
      //Deny uploads if user is not logged in.
      if (!this.userId) {
        var message = "Please login before posting files";
        throw new Meteor.Error("Login Required", message);
      }

      return true;
    },

    key: function (file) {
      //Store file into a directory by the user's username.
      var user = Meteor.users.findOne(this.userId);
      return this.userId + "/" + file.name;
    }
  });
}
