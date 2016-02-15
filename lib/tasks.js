
Tasks.schema = new SimpleSchema([BaseSchema, {
    description: {type: String},
    status: {type: Number},
    isArchived: {type: Boolean},
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
        console.log('-- adding task to conversation ' + conversationId + " with description: '" + description + "'");
        if (!this.userId) {
            console.error('-- user ' + Meteor.user().username + ' is not authorised to add task to this conversation');
            throw new Meteor.Error("Tasks.methods.addTask.not-authorized");
        }

        var conversation = Conversations.findOne(conversationId);

        if (conversation == null) {
            console.error('-- Cannot find conversation with id ' + conversationId);
            throw Meteor.Error(
                'Tasks.methods.addTask.invalid-conversation-id',
                'Error adding task - invalid conversation ID: ' + conversationId
            );
        }

        var project = Projects.findOne(conversation.defaultProjectId);

        if (project == null) {
            console.error('-- Cannot find default project for ' + conversationId + '. (default project id is set to ' + conversation.defaultProjectId + ')');
            throw Meteor.Error(
                'Tasks.methods.addTask.invalid-default-project',
                'Unable to find user default project for conversation ' + conversationId
            )
        }

        var key = incrementCounter('counters', project._id);
        console.log('-- saving task with key ' + key);
        var now = new Date();
        var task = {
            description:description,
            status: Ols.Status.NEW,
            isArchived: false,
            createdAt: now,
            updatedAt: now,
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
        console.log("-- task " + task.key + " saved as task " + task._id + ".");

        console.log("-- Adding initial ref for task " + task.key + ".");
        var message = ServerMessages.findOne(messageId);
        if(message == null) {
            console.error("-- can't add a ref for this task as unable to find the message that the task was created from (messageId=" + messageId + ").");
        } else {
            console.log("-- message that created this task found - adding ref for it now...");
            Refs.methods.addRef.call({
                messageId: messageId,
                taskId: taskId,
                taskKey: key,
                messageSeq: message.seq,
                messageContent: message.content
            }, (err, ref) => {
                if (err) {
                    if (err.message) {
                        console.error("Error adding ref: " + err.message);
                    } else {
                        console.error("- Error adding ref: " + err.reason);
                    }
                } else {
                    console.log("-- ref " + ref._id + " added successfully for task " + key + ".");
                }
            });
        }
        return task;
    }
});

Tasks.methods.updateTaskStatus = new ValidatedMethod({
    name: 'Tasks.methods.updateTaskStatus',

    validate: new SimpleSchema({
        conversationId: {type: String},
        key: {type: Number},
        status: {type: Number}
    }).validator(),

    run({conversationId, key, status}) {
        var task = Tasks.findOne({conversationId: conversationId, key: key});
        if(task == null) {
            throw new Meteor.Error("Tasks.methods.updateTaskStatus.not-exist", "Task " + key + " doesn't exist");
        }
        Tasks.update({conversationId, key}, {$set: {status: status}});

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
        var task = Tasks.findOne({conversationId:conversationId, key: key});
        if(task == null) {
            throw new Meteor.Error("Tasks.methods.removeTask.not-exist", "Task " + key + " doesn't exist");
        }
        console.log("-- Removing task " + key  + " from conversation " + conversationId);

        var result = Tasks.remove({conversationId: conversationId, key: key});
        console.log("-- Remove result is " + result);
        console.log("< removeTask");
    }
});
