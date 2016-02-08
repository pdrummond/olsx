Tasks = new Mongo.Collection('tasks');

Tasks.schema = new SimpleSchema([BaseSchema, {
    description: {type: String},
    status: {type: String},
    seq: {type: Number},
    key: {type: String},
    messageId: {type: String},
    conversationId: {type: String},
    projectId: {type:String},
    projectType: {type:String}
}]);

Tasks.attachSchema(Tasks.schema);

Tasks.methods = {};
Tasks.methods.addTask = new ValidatedMethod({
    name: 'Tasks.methods.addTask',

    validate: new SimpleSchema({
        description: {type: String},
        conversationId: {type: String},
        messageId: {type: String}
    }).validator(),

    run({description, conversationId, messageId}) {
        if (!this.userId) {
            throw new Meteor.Error("Tasks.methods.addTask.not-authorized");
        }

        var conversation = Conversations.findOne(conversationId);

        if (conversation == null) {
            throw Meteor.Error(
                'Tasks.methods.addTask.invalid-conversation-id',
                'Error adding task - invalid conversation ID: ' + conversationId
            );
        }

        var project = Projects.findOne(conversation.defaultProjectId);

        if (project == null) {
            throw Meteor.Error(
                'Tasks.methods.addTask.invalid-default-project',
                'Unable to find user default project for conversation ' + conversationId
            )
        }

        var seq = incrementCounter('counters', project._id);
        var key = '';
        if (project.key) {
            key = project.key + '-' + seq;
        } else {
            key = seq;
        }

        var task = {
            description:description,
            status: 'new',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: Meteor.userId(),
            createdByName: Meteor.user().username,
            updatedBy: Meteor.userId(),
            updatedByName: Meteor.user().username,
            messageId: messageId,
            projectId: project._id,
            projectType: Ols.PROJECT_TYPE_CONVERSATION_DEFAULT,
            conversationId: conversationId,
            seq: seq,
            key: key
        };

        var taskId = Tasks.insert(task);
        task._id = taskId;
        return task;
    }
});
