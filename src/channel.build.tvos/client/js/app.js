require('babel-polyfill');

import Settings from './settings';
import Utility from './utility';
import NetworkController from './network-controller';
import ResourceLoader from './resource-loader';
import ChannelApi from './channel-api';
import DataController from './data-controller';
import Presenter from './presenter';

App.onLaunch = ({tvjsClientUrl, webApiUrl, channelId, deviceId}) => {
  const resourceLoaderNetworkController = new NetworkController(tvjsClientUrl);
  const channelApiNetworkController = new NetworkController(webApiUrl);
  const resourceLoader = new ResourceLoader(resourceLoaderNetworkController);
  const channelApi = new ChannelApi(channelApiNetworkController, channelId);
  const dataController = new DataController(resourceLoader, channelApi);
  const presenter = new Presenter(resourceLoader, dataController);

  presenter.presentRoot(Settings.rootTemplate);
};
