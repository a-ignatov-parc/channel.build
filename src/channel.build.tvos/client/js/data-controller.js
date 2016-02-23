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
    console.log(method, args);
    args = args ? JSON.parse(args) : {};
    console.log(method, args);
    return this[method] ? this[method](args) :
                          this.channelApi[method] ? this.channelApi[method](args) :
                                                    Promise.resolve({});
  }
}

module.exports = DataController;
