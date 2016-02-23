require('babel-polyfill');

import Settings from './settings';
import Utility from './utility';
import NetworkController from './network-controller';
import ResourceLoader from './resource-loader';
import ChannelApi from './channel-api';
import DataController from './data-controller';
import Presenter from './presenter';

App.onLaunch = ({hostUrl, apiUrl, channelId}) => {
  const resourceLoaderNetworkController = new NetworkController(hostUrl);
  const channelApiNetworkController = new NetworkController(apiUrl);
  const resourceLoader = new ResourceLoader(resourceLoaderNetworkController);
  const channelApi = new ChannelApi(channelApiNetworkController, channelId);
  const dataController = new DataController(resourceLoader, channelApi);
  const presenter = new Presenter(resourceLoader, dataController);

  channelApi.getVideos().then((videos) => {
    console.log(videos);
  });

  presenter.presentRoot(Settings.rootTemplate);
};
