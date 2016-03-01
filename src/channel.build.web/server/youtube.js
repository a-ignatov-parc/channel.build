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
        thumbnail: x.snippet.thumbnails.medium.url
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
        importId: x.id,
        title: x.snippet.title,
        description: x.snippet.description,
        thumbnails: x.snippet.thumbnails
      };
    });
  }
});
