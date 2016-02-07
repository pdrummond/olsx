Meteor.publish("conversations", function () {
    return Conversations.find();
});

Meteor.publish('currentConversation', function(conversationId) {
    var c = Conversations.find(conversationId);
    return c;
});
