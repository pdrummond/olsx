//TODO: Rename this to server-message-api.js to make it more explicit

MessageApi = function() {
};

MessageApi.prototype.systemErrorMessage = function(conversationId, errMsg) {
    return Meteor.call('systemErrorMessage', conversationId, errMsg);
};

MessageApi.prototype.systemSuccessMessage = function(conversationId, msg) {
    return Meteor.call('systemSuccessMessage', conversationId, msg);
};

MessageApi.prototype.saveMessage = function(conversationId, errMsg) {
    return Meteor.call('saveMessage', conversationId, errMsg);
};

Ols.Message = new MessageApi();
