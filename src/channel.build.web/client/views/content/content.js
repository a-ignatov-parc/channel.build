Template.content.helpers({
  create: function() {

  },
  videos: function() {
    return Videos.find().fetch();
  }
});
