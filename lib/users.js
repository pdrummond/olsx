Meteor.methods({
    updateUserSetCurrentConversation: function(userId, conversationId) {
        Meteor.users.update(userId, {$set: {currentConversationId: conversationId}});
    },

    updateUserUnSetCurrentConversation: function(userId) {
        Meteor.users.update(userId, {$unset: {currentConversationId: ''}});
    }
});