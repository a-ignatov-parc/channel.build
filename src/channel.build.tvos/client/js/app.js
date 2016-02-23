require('babel-polyfill');

import Settings from './settings';
import Utility from './utility';
import NetworkController from './network-controller';
import ResourceLoader from './resource-loader';
import ChannelApi from './channel-api';
import Presenter from './presenter';

App.onLaunch = ({hostUrl, apiUrl, channelId}) => {
  const resourceLoaderNetworkController = new NetworkController(hostUrl);
  const channelApiNetworkController = new NetworkController(apiUrl);
  const resourceLoader = new ResourceLoader(resourceLoaderNetworkController);
  const channelApi = new ChannelApi(channelApiNetworkController, channelId);
  const presenter = new Presenter(resourceLoader);

  channelApi.getVideos().then((videos) => {
    console.log(videos);
  });

  presenter.presentModal('alert.tvml', {
    title: 'Hello, World!',
    description: 'App infrastructure is ready!'
  });
};
