if (Meteor.isClient) {
  Template.content.helpers({
    create: function() {

    },
    videos: function() {
      return Videos.find({}, {sort: {position: 1}}).fetch().map(function(e) {
        e.hasThumbnail = e.thumbnails && e.thumbnails.medium && e.thumbnails.medium.url ? true : false;
        return e;
      })
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
  });

  Template.content.onRendered(function() {
    var toArray = function(nodeList) {
      return Array.prototype.slice.call(nodeList);
    }

    var containers = toArray(document.querySelectorAll('.video-drag-area'));
    dragula(containers).
      on('drop', function (el) {
        var update = [];
        Array.prototype.forEach.call(containers[0].children, function(c, idx) {
          var videoId = c.attributes.data.value;
          Videos.update(videoId, {
            $set: {
              'position': idx
            }
          });
        });
      })
  });
}
