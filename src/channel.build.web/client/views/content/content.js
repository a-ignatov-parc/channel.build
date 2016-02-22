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
  }
})
