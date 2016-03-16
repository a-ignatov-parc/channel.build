if (Meteor.isClient) {
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
      Session.set('playlistLoading', true);

      Meteor.call('getYoutubeUserPlaylists', event.target.username.value, function(err, response) {
        Session.set('playlistLoading', false);

        if (err) {
          Session.set('error', err.message);
          return;
        }

  			Session.set('playlists', response);
  		});
    },
    'click .playlist-add': function(event) {
      Session.set('error', null);
      Session.set('videosLoading', true);

      var playlistId = event.target.attributes.data.value;
      Meteor.call('addYoutubePlaylist', playlistId, function(err, response) {
        Session.set('videosLoading', false);

        if (err) {
          Session.set('error', err.message);
          return;
        }

        addVideos(response, 'youtube');

        Session.set('playlists', Session.get('playlists').filter(function(e){
          return e.id != playlistId;
        }));
  		});
    }
  });

  Template.youtube.helpers({
    playlists: function () {
      return Session.get('playlists');
    },
    playlistLoading: function () {
      return Session.get('playlistLoading');
    },
    userName: function () {
      return Meteor.user().profile ? Meteor.user().profile.userName : "";
    }
  })
}

if (Meteor.isServer) {
  Meteor.methods({
    getYoutubeUserPlaylists: function (name) {
      var userResult = Meteor.http.get("" +
        "https://www.googleapis.com/youtube/v3/channels?forUsername=" +
        name +
        "&part=contentDetails&key=AIzaSyB90nW3IGhRXI-XdR3A1v0bPQoGEc7m80I&maxResults=50");

      if(userResult.statusCode != 200) {
        throw new Meteor.Error(400, "Failed to communicate with youtube to read users.");
      }

      if (!userResult.data.items || userResult.data.items.length == 0 || userResult.data.items.length > 1) {
        throw new Meteor.Error(400, "Could not find youtube user '" + name + "', please try again.");
      }

      playlistsResult = Meteor.http.get("" +
        "https://www.googleapis.com/youtube/v3/playlists?channelId=" +
        userResult.data.items[0].id +
        "&part=contentDetails,snippet&key=AIzaSyB90nW3IGhRXI-XdR3A1v0bPQoGEc7m80I&maxResults=50");

      if(playlistsResult.statusCode != 200) {
        throw new Meteor.Error(400, "Failed to communicate with youtube to read playlists.");
      }

      if (!playlistsResult.data.items || playlistsResult.data.items.length == 0) {
        throw new Meteor.Error(400, "Could not find any playlists for this user.");
      }

      return playlistsResult.data.items.map(function(x) {
        return {
          id: x.id,
          title: x.snippet.title,
          description: x.snippet.description,
          thumbnail: x.snippet.thumbnails && x.snippet.thumbnails.medium ? x.snippet.thumbnails.medium.url : null
        };
      });
    },
    addYoutubePlaylist: function (playlistId) {
      var playlistResult = Meteor.http.get("" +
        "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" +
        playlistId +
        "&key=AIzaSyB90nW3IGhRXI-XdR3A1v0bPQoGEc7m80I");

      if(playlistResult.statusCode != 200) {
        throw new Meteor.Error(400, "Failed to communicate with youtube to read playlist.");
      }

      return playlistResult.data.items.map(function(x) {
        return {
          importType: 'youtube',
          importId: x.snippet.resourceId.videoId,
          title: x.snippet.title,
          description: x.snippet.description,
          thumbnails: x.snippet.thumbnails
        };
      });
    }
  });
}
