
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
});

Template.youtube.helpers({
  playlists: function () {
    return Session.get('playlists');
  },
  loading: function () {
    return Session.get('loading');
  }
})
