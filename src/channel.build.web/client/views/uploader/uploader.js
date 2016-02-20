var uploaders = {};

Template.uploaderInstance.created = function() {
  uploaders[this.data.id] = new Slingshot.Upload("uploader");
};

Template.uploaderInstance.destroyed = function() {
};

Template.uploaderInstance.helpers({
  progress: function () {
    return Math.round(uploaders[this.id].progress() * 100);
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

Template.uploaderInstance.events({
  "change input": function(event) {
    var this_ = this;
    uploaders[this_.id].send(event.target.files[0], function (error, downloadUrl) {
      if (error) {
        console.error('Error uploading', uploaders[this_.id].xhr.response);
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
