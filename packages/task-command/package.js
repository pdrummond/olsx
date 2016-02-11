Package.describe({
  name: 'ols:task-command',
  version: '0.0.1',
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['ecmascript', 'ols:lib', 'meteor-platform', 'react']);
  api.addFiles('task-command.jsx');
});
