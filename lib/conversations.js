Conversations = new Mongo.Collection('conversations');

Conversations.schema = new SimpleSchema([BaseSchema, {
    subject: {type: String},
    defaultProjectId: {type: String},
}]);

Conversations.attachSchema(Conversations.schema);

Conversations.methods = {};
Conversations.methods.addConversation = new ValidatedMethod({
    name: 'Conversations.methods.addConversation',
    validate: new SimpleSchema({
        subject: {type: String}
    }).validator(),
    run({subject}) {
        if (!this.userId) {
            throw new Meteor.Error("Conversations.methods.addConversation.not-authorized");
        }

        var now = new Date();
        var projectId = Projects.insert({
            title: slugify(subject) + "_DEFAULT_PROJECT",
            type: Ols.PROJECT_TYPE_CONVERSATION_DEFAULT,
            createdAt: now,
            updatedAt: now,
            createdBy: Meteor.userId(),
            updatedBy: Meteor.userId(),
            createdByName: Meteor.user().username,
            updatedByName: Meteor.user().username
        }, (err) => {
           if(err) {
               console.error('Error adding default project for conversation: ' + err);
               throw new Meteor.Error("Conversations.methods.addConversation.add-default-project-failed", err);
           }
        });

        var now = new Date();
        var conversation = {
            subject: subject,
            defaultProjectId: projectId,
            createdAt: now,
            updatedAt: now,
            createdBy: Meteor.userId(),
            updatedBy: Meteor.userId(),
            createdByName: Meteor.user().username,
            updatedByName: Meteor.user().username
        };

        var conversationId = Conversations.insert(conversation);
        conversation._id = conversationId;
        return conversation;
    },
});

Conversations.methods.removeConversation = new ValidatedMethod({
    name: 'Conversations.methods.removeConversation',
    validate: new SimpleSchema({
        conversationId: {type: String}
    }).validator(),

    run({conversationId}) {
        if (!this.userId) {
            throw new Meteor.Error("Conversations.methods.removeConversation.not-authorized");
        }
        //remove all conversation-specific tasks - if the tasks was created in a conversation but belongs to a
        //project, then we don't remove it just because the conversation is being removed.
        Tasks.remove({conversationId:conversationId, projectType:Ols.PROJECT_TYPE_CONVERSATION_DEFAULT});
        if(Meteor.isServer) {
            ServerMessages.remove({conversationId: conversationId});
        }
        Conversations.remove(conversationId);
    }
});

