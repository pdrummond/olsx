Conversations = new Mongo.Collection('conversations');

Meteor.methods({
    addConversation(title) {
        if (! Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        var now = new Date().getTime();
        Conversations.insert({
            title: title,
            createdAt: now,
            updatedAt: now,
            createdBy: Meteor.userId(),
            updatedBy: Meteor.userId(),
            createdByName: Meteor.user().username,
            updatedByName: Meteor.user().username,
        });
    },

    removeConversation(conversationId) {
        Conversations.remove(conversationId);
    },
});

if (Meteor.isServer) {
    Meteor.publish("conversations", function () {
        return Conversations.find();
    });

    Meteor.publish('currentConversation', function(conversationId) {
        var c = Conversations.find(conversationId);
        return c;
    });
}
