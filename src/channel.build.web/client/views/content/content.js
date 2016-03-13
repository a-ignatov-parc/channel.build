Template.content.helpers({
  create: function() {

  },
  videos: function() {
    return Videos.find().fetch();
  },
  videosLoading: function() {
    return Session.get("videosLoading");
  }
});

Template.content.events({
  'click .content-delete-all': function() {
    Videos.find().fetch().forEach(function(video) {
      Videos.remove({
        _id: video._id
      });
    });
  },
  'click span.content-select-video-button': function(event) {
    var videoId = event.target.attributes.data.value;
    var video = Videos.findOne({'_id': videoId});
    Videos.update(videoId, {
      $set: {
        'selected': !video.selected
      }
    });
  }
})
