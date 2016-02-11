Conversations = new Mongo.Collection('conversations');

Conversations.schema = new SimpleSchema([BaseSchema, {
    subject: {type: String},
    defaultProjectId: {type: String},
    seenList: {type: [String]}
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

        var userId = Meteor.userId();
        var username = Meteor.user().username;
        var now = new Date();
        var projectId = Projects.insert({
            title: slugify(subject) + "_DEFAULT_PROJECT",
            type: Ols.PROJECT_TYPE_CONVERSATION_DEFAULT,
            createdAt: now,
            updatedAt: now,
            createdBy: userId,
            updatedBy: userId,
            createdByName: username,
            updatedByName: username,
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
            createdBy: userId,
            updatedBy: userId,
            createdByName: username,
            updatedByName: username,
            seenList: [],
        };

        var conversationId = Conversations.insert(conversation);
        console.log('>> added conversation ' + conversationId);
        conversation._id = conversationId;

        var member = {
            userId: userId,
            username: username,
            conversationId: conversationId,
            role: Ols.ROLE_ADMIN,
            createdAt: now,
            updatedAt: now,
            createdBy: userId,
            updatedBy: userId,
            createdByName: username,
            updatedByName: username
        };

        Members.insert(member);

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


Conversations.methods.markAsSeen = new ValidatedMethod({
    name: 'Conversations.methods.markAsSeen',

    validate: new SimpleSchema({
        conversationId: {type: String},
        userId: {type: String}
    }).validator(),

    run({conversationId, userId}) {
        var conv = Conversations.findOne(conversationId);
        if(conv.seenList.indexOf(userId) == -1) {
            console.log('Conversations.methods.markAsSeen(conversationId=' + conversationId + ', userId=' + userId);
            var result = Conversations.update(conversationId, {
                $addToSet: {seenList: userId},
                $set: {updatedAt: new Date()}
            });
            console.log('Conversations.methods.markAsSeen result=' + result);
        }
    }
});

