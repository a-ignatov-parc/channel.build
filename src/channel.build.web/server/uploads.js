
Slingshot.fileRestrictions("uploader", {
  allowedFileTypes: ["image/png", "image/jpeg", "image/gif"],
  maxSize: 10 * 1024 * 1024 // 10 MB (use null for unlimited).
});

Slingshot.createDirective("uploader", Slingshot.S3Storage, {
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
