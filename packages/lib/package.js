Package.describe({
  name: 'ols:lib',
  version: '0.0.1',
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['ecmascript', 'meteor-platform', 'osv:mongo-counter', 'aldeed:simple-schema']);
  api.addFiles([
    'lib.js',
    'command-api.js',
    'message-api.js',
    'activity-api.js',
    'links-api.js',
    'filter-api.js',    
    'stringutils-api.js',
    'loopbot-api.js',
    'status-type-api.js',
    'question-status-type-api.js',
    'item-type-api.js',
    'role-type-api.js',
    'project-type-api.js',
    'milestone-type-api.js',
    'activity-type-api.js',
    'release-type-api.js',
    'keys-api.js',
    'counter-api.js',
    'router-api.js'
  ]);
  api.export(['Ols']);
});
