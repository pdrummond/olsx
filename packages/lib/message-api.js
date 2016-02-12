MessageApi = function() {
};

MessageApi.prototype.systemErrorMessage = function(conversationId, errMsg) {
    Meteor.call('systemErrorMessage', conversationId, errMsg);
};

MessageApi.prototype.systemSuccessMessage = function(conversationId, msg) {
    Meteor.call('systemSuccessMessage', conversationId, msg);
};

MessageApi.prototype.saveCustomMessage = function(customMessageType, conversationId, attrs) {
    Meteor.call('saveMessage', _.extend(attrs, {
        conversationId: conversationId,
        messageType: Ols.MESSAGE_TYPE_CUSTOM,
        customMessageType: customMessageType,
        createdBy: Meteor.userId(),
        updatedBy: Meteor.userId(),
        createdByName: Meteor.user().username,
        updatedByName: Meteor.user().username
    }));
};

MessageApi.prototype.saveMessage = function(conversationId, errMsg) {
    Meteor.call('saveMessage', conversationId, errMsg);
};

Ols.Message = new MessageApi();