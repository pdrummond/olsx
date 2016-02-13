//TODO: Rename this to server-message-api.js to make it more explicit

MessageApi = function() {
};

MessageApi.prototype.systemErrorMessage = function(conversationId, errMsg) {
    Meteor.call('systemErrorMessage', conversationId, errMsg);
};

MessageApi.prototype.systemSuccessMessage = function(conversationId, msg) {
    Meteor.call('systemSuccessMessage', conversationId, msg);
};

MessageApi.prototype.saveMessage = function(conversationId, errMsg) {
    Meteor.call('saveMessage', conversationId, errMsg);
};

Ols.Message = new MessageApi();