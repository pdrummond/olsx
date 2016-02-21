Package.describe({
  name: 'ols:github',
  version: '0.0.1'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['ecmascript', 'simple:json-routes', 'ols:lib', 'react']);
  api.addFiles(['github.jsx', 'GithubMessage.jsx'], ['server', 'client']);
});