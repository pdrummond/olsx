Meteor.publish("conversations", function () {
    this.autorun(function(computation) {
        var conversationIds = Members.find({userId: this.userId}).map(function (member) {
            return member.conversationId;
        });
        return Conversations.find({_id: {$in: conversationIds}});
    });
});

Meteor.publish('currentConversation', function(conversationId) {
    this.autorun(function(computation) {
        var c = Conversations.find(conversationId);
        return c;
    });
});

Meteor.publish("currentConversationMembers", function (conversationId) {
    return Members.find({conversationId: conversationId});
});


Meteor.publish("allUsernames", function () {
    return Meteor.users.find({}, {fields: {
        "username": 1,
        "profileImage": 1,
        "currentConversationId": 1
    }});
});

Meteor.publish("userStatus", function() {
    return Meteor.users.find({ "status.online": true }, { fields: { "username": 1, "status":1 } });
});

