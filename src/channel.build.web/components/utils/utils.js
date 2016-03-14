if (Meteor.isClient) {
  addVideos = function(videoList, importType) {
    var app = Apps.findOne();
    var lastVideo = Videos.findOne({
      userId: Meteor.userId()
    }, {
      sort: {position: -1}
    });
    var videoOffset = lastVideo ? lastVideo.position + 1 : 0;

    videoList.forEach(function(videoInfo, idx) {
      originalKey = {
        userId: Meteor.userId(),
        appId: app._id,
        importType: importType,
        importId: videoInfo.importId
      };

      videoInfo.position = videoOffset + idx;
      videoInfo.userId = Meteor.userId();
      videoInfo.appId = app._id;
      videoInfo.video = videoInfo.video ? videoInfo.video : null;
      videoInfo.selected = true;

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

    // Update videos with 'chan import' if this is not schedulet yet.
    var jobData = { channelId: app._id },
        jobQuery = { type: 'import', status: /waiting|ready|running/, data: jobData };
    if (!ChanJobs.find(jobQuery).count()) {
      Job(ChanJobs, 'import', jobData).save();
    }
  };
}
