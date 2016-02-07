MessageApi = function() {
};

MessageApi.prototype.systemMessage = function(conversationId, errMsg) {
    Meteor.call('systemErrorMessage', conversationId, errMsg);
};

MessageApi.prototype.saveCustomMessage = function(customMessageType, conversationId, attrs) {
    Meteor.call('saveMessage', _.extend(attrs, {
        conversationId: conversationId,
        messageType: Ols.MESSAGE_TYPE_CUSTOM,
        customMessageType: customMessageType,
        createdBy: Meteor.userId(),
        updatedBy: Meteor.userId(),
        createdByUsername: Meteor.user().username,
        updatedByUsername: Meteor.user().username
    }));
};

MessageApi.prototype.saveMessage = function(conversationId, errMsg) {
    Meteor.call('saveMessage', conversationId, errMsg);
};

Ols.Message = new MessageApi();