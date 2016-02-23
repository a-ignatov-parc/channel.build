/**
 * Web API for Channel App.
 */

import NetworkController from './network-controller';

class ChannelApi {
  constructor(networkController, channelId) {
    this.networkController = networkController;
    this.channelId = channelId;
  }

  /**
   * Gets all video content for the channel.
   * @return {promise} The result of promise contains JSON array of videos.
   */
  getVideos() {
    return this.networkController.getJson(`channels/${this.channelId}`);
  }
}

module.exports = ChannelApi;
