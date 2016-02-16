require('babel-polyfill');

import Utility from './utility';
import NetworkController from './network-controller';
import ResourceLoader from './resource-loader';
import Presenter from './presenter';

App.onLaunch = ({hostUrl}) => {
  const networkController = new NetworkController(hostUrl);
  const resourceLoader = new ResourceLoader(networkController);
  const presenter = new Presenter(resourceLoader);

  presenter.presentModal('alert.tvml', {
    title: 'Hello, World!',
    description: 'App infrastructure is ready!'
  });
};
