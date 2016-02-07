
Meteor.methods({
    addConversation(title) {
        if (! Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        var projectId = Projects.insert({
            title: slugify(title) + "_DEFAULT_PROJECT",
            type: Ols.PROJECT_TYPE_CONVERSATION_DEFAULT,
        });

        var conversation = {
            title: title,
            defaultProjectId: projectId,
            createdAt: now,
            updatedAt: now,
            createdBy: Meteor.userId(),
            updatedBy: Meteor.userId(),
            createdByName: Meteor.user().username,
            updatedByName: Meteor.user().username
        };

        var now = new Date().getTime();
        var conversationId = Conversations.insert(conversation);
    },

    removeConversation(conversationId) {
        Conversations.remove(conversationId);
    },
});

