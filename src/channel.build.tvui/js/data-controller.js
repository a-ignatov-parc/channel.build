import fuzzysearch from 'fuzzysearch';

class DataController {
  constructor(resourceLoader, channelApi) {
    this.resourceLoader = resourceLoader;
    this.channelApi = channelApi;
    // this.cloudDataStore = CloudDataStore.create();
  }

  getData(data) {
    return Promise.resolve(data ? JSON.parse(data) : {});
  }

  getDataFromMethod(method, args) {
    args = args ? JSON.parse(args) : {};
    return this[method] ? this[method](args) :
                          this.channelApi[method] ? this.channelApi[method](args) :
                                                    Promise.resolve({});
  }

  fuzzySearchVideos(query, videos) {
    query = query.toLowerCase();
    return videos.filter((video) => fuzzysearch(query, video.title.toLowerCase()));
  }

  getVideos() {
    return new Promise((resolve, reject) => {
      this.channelApi.getVideos().then((videos) => {
        resolve(videos.map((video) => {
          const productId = video.productId;
          video.isPurchased = false;//video.isPaid ? Purchases.isProductPurchased(productId) : false;
          video.isPurchasable = video.isPaid && !video.isPurchased;
          video.price = Purchases.getLocalizedPrice(productId);
          return video;
        }));
      });
    });
  }
}

module.exports = DataController;
