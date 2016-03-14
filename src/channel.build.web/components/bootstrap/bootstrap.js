if (Meteor.isServer) {
  Meteor.startup(function() {
    console.log("Server started");

    Houston.add_collection(Meteor.users);
    Houston.add_collection(Houston._admins);
  });

  Meteor.publish("myApp", function () {
    return Apps.find(
      {'userId': this.userId}
    );
  });

  Meteor.publish("myInvites", function () {
    return Invites.find(
      {'userId': this.userId}
    );
  });

  Meteor.publish("myVideos", function () {
    return Videos.find(
      {'userId': this.userId}
    );
  });
}
