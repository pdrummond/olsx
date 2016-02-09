Meteor.publish("conversations", function () {
    this.autorun(function(computation) {
        console.log('> publish conversations');
        var conversationIds = Members.find({userId: this.userId}).map(function (member) {
            return member.conversationId;
        });
        console.log('conversationIds' + JSON.stringify(conversationIds));

        console.log('< publish conversations');
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
        "profileImage": 1
    }});
});

