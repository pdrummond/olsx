Package.describe({
  name: 'ols:lib',
  version: '0.0.1',
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['ecmascript', 'meteor-platform']);
  api.addFiles([
    'lib.js',
    'command-api.js',
    'message-api.js',
    'filter-api.js',
    'stringutils-api.js',
    'loopbot-api.js',
    'status-type-api.js'
  ]);
  api.export(['Ols']);
});

