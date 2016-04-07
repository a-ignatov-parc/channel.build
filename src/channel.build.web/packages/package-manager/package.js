Package.describe({
  name: 'package-manager',
  version: '0.0.1',
  summary: 'Package manager to load environment specific packages for channel.build.'
});

Package.onUse(function (api) {
  api.versionsFrom('1.2.1');

  switch (process.env.NODE_ENV) {
  case 'production':
    api.use('meteorhacks:cluster');
    break;
  case 'development':
  default:
    break;
  }
});
