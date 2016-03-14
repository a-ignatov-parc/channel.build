if (Meteor.isClient) {
  var imageUploaders = {};

  Template.imageUploader.created = function() {
    imageUploaders[this.data.id] = new Slingshot.Upload("imageUploader");
  };

  Template.imageUploader.destroyed = function() {
  };

  Template.imageUploader.helpers({
    progress: function () {
      return Math.round(imageUploaders[this.id].progress() * 100);
    },
    url: function () {
      var usersApp = Apps.findOne();
      return usersApp[this.name];
    },
    sampleWidth: function () {
      return Math.max(400 / 3, this.width / 7);
    },
    sampleHeight: function () {
      return Math.max(240 / 3, this.height / 7);
    }
  });

  Template.imageUploader.events({
    "change input": function(event) {
      var this_ = this;
      imageUploaders[this_.id].send(event.target.files[0], function (error, downloadUrl) {
        if (error) {
          console.error('Error uploading', imageUploaders[this_.id].xhr.response);
          alert (error);
        }
        else {
          var usersApp = Apps.findOne();
          if (usersApp) {
            appChange = {};
            appChange[this_.name] = downloadUrl;

            Apps.update(usersApp._id, {
              $set: appChange
            });
          }
        }
      });
    }
  });
}

if (Meteor.isServer) {
  Slingshot.fileRestrictions("imageUploader", {
    allowedFileTypes: ["image/png", "image/jpeg", "image/gif"],
    maxSize: 10 * 1024 * 1024 // 10 MB (use null for unlimited).
  });

  Slingshot.createDirective("imageUploader", Slingshot.S3Storage, {
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
