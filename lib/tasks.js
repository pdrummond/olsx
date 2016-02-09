Tasks = new Mongo.Collection('tasks');

Tasks.schema = new SimpleSchema([BaseSchema, {
    description: {type: String},
    status: {type: String},
    key: {type: Number},
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

        var key = incrementCounter('counters', project._id);

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
            key: key
        };

        var taskId = Tasks.insert(task);
        task._id = taskId;
        return task;
    }
});

Tasks.methods.removeTask = new ValidatedMethod({
    name: 'Tasks.methods.removeTask',

    validate: new SimpleSchema({
        conversationId: {type: String},
        key: {type: Number}
    }).validator(),

    run({conversationId, key}) {
        console.log("> removeTask(conversationId=" + conversationId + ", key=" + key + ")");
        if (!this.userId) {
            throw new Meteor.Error("Tasks.methods.removeTask.not-authorized");
        }
        var task = Tasks.findOne({key: key});
        if(task == null) {
            throw new Meteor.Error("Tasks.methods.removeTask.not-exist", "Task " + key + " doesn't exist");
        }
        console.log("-- Removing task " + key  + " from conversation " + conversationId);

        var result = Tasks.remove({conversationId: conversationId, key: key});
        console.log("-- Remove result is " + result);
        console.log("< removeTask");
    }
});
