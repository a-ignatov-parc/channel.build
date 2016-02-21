
Template.youtube.events({
  'click #username': function(event) {
    var top = $(event.target).offset().top - 85;
    $('html, body').animate({
      scrollTop: top
    }, 'slow');
  },
  'submit form': function(event) {
    event.preventDefault();

    Session.set('error', null);
    Session.set('loading', true);

    Meteor.call('getYoutubeUserPlaylists', event.target.username.value, function(err, response) {
      Session.set('loading', false);

      if (err) {
        Session.set('error', err.message);
        return;
      }

			Session.set('playlists', response);
		});
  },
  'click .playlist-item': function(event) {
    Session.set('error', null);
    Session.set('loading', true);

    var playlistId = event.target.attributes.data.value;
    Meteor.call('addYoutubePlaylist', playlistId, function(err, response) {
      Session.set('loading', false);

      if (err) {
        Session.set('error', err.message);
        return;
      }

      var lastVideo = Videos.findOne({
        userId: Meteor.userId()
      }, {
        sort: {position: -1}
      });
      var videoOffset = lastVideo ? lastVideo.position + 1 : 0;

      response.forEach(function(videoInfo, idx) {
        originalKey = {
          userId: Meteor.userId(),
          importType: 'youtube',
          importId: videoInfo.importId
        };

        videoInfo.position = videoOffset + idx;
        videoInfo.userId = Meteor.userId();

        var video = Videos.findOne(originalKey);
        if (video) {
          Videos.update({_id: video.id}, {
            $set: videoInfo
          });
        }
        else {
          Videos.insert(videoInfo);
        }
      });
		});
  }
});

Template.youtube.helpers({
  playlists: function () {
    return Session.get('playlists');
  },
  loading: function () {
    return Session.get('loading');
  }
})
