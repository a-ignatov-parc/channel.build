/**
 * Web API for Channel App.
 */

class ChannelApi {
  constructor(networkController, channelId, deviceId) {
    this.networkController = networkController;
    this.channelId = channelId;
    this.deviceId = deviceId;
  }

  /**
   * Gets all video content for the channel.
   * @return {promise} The result of promise contains JSON array of videos.
   */
  getVideos() {
    return this.networkController.getJson(`channels/${this.channelId}`);
  }

  postAnalytics(analytic) {
    analytic.deviceId = this.deviceId;
    return this.networkController.postJson(`analytics/channels/${this.channelId}`, analytic);
  }
}

module.exports = ChannelApi;
