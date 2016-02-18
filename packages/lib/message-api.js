//TODO: Rename this to server-message-api.js to make it more explicit

MessageApi = function() {
};

MessageApi.prototype.systemErrorMessage = function(projectId, errMsg) {
    return Meteor.call('systemErrorMessage', projectId, errMsg);
};

MessageApi.prototype.systemSuccessMessage = function(projectId, msg) {
    return Meteor.call('systemSuccessMessage', projectId, msg);
};

MessageApi.prototype.saveMessage = function(projectId, errMsg) {
    return Meteor.call('saveMessage', projectId, errMsg);
};

Ols.Message = new MessageApi();
