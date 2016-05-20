import fuzzysearch from 'fuzzysearch';

/**
 * Data controller exposes methods to fetch data for templates.
 * These methods are used through 'data-method' and 'data' attributes of TVML elements.
 */

class DataController {
  constructor(resourceLoader, channelApi) {
    this.resourceLoader = resourceLoader;
    this.channelApi = channelApi;
  }

  /**
   * Parses data from JSON string. It is used for 'data' attribute of TVML elements.
   * @param  {string}  data Data in JSON format.
   * @return {promise}      The result of promise contains parsed JSON data.
   */
  getData(data) {
    return Promise.resolve(data ? JSON.parse(data) : {});
  }

  /**
   * Gets data from method call. It is used for 'data-method' attribute of TVML elements.
   * It looks for the method in DataController class first.
   * If it is not presented, then it looks for the method in ChannelApi class.
   * Otherwise returns empty promise.
   * @param  {string}  method Name of the method to get data from.
   * @param  {object}  args   Object with method arguments.
   * @return {promise}        The result of promise contains data received from the method.
   */
  getDataFromMethod(method, args) {
    args = args ? JSON.parse(args) : {};
    return this[method] ? this[method](args) :
                          this.channelApi[method] ? this.channelApi[method](args) :
                                                    Promise.resolve({});
  }

  /**
   * Filters videos by title with query string using 'fuzzysearch' package.
   * @param  {string} query  Query string to filter videos by title.
   * @param  {array}  videos Array of videos to filter out.
   * @return {array}         Filtered array of videos by title.
   */
  fuzzySearchVideos(query, videos) {
    query = query.toLowerCase();
    return videos.filter((video) => fuzzysearch(query, video.title.toLowerCase()));
  }

  /**
   * Gets videos for the channel from Channel REST API.
   * @return {promise} The result of promise contains an array of videos for the channel.
   */
  getVideos() {
    return new Promise((resolve, reject) => {
      this.channelApi.getVideos().then((videos) => {
        const productIds = videos.filter((v) => v.productId).map((v) => v.productId);
        Purchases.getLocalizedPrices(productIds, (prices, error) => {
          if (error) {
            reject(Error(error.message));
          } else {
            resolve(videos.map((video) => {
              const productId = video.productId;
              video.isPurchased = video.isPaid ? Purchases.isProductPurchased(productId) : false;
              video.isPurchasable = video.isPaid && !video.isPurchased;
              video.price = prices[productId] || 'free';
              return video;
            }));
          }
        });
      });
    });
  }
}

module.exports = DataController;
