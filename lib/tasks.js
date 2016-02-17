
Tasks.schema = new SimpleSchema([BaseSchema, {
    description: {type: String},
    status: {type: Number},
    isArchived: {type: Boolean},
    key: {type: Number},
    messageId: {type: String},
    messageSeq: {type: Number},
    conversationId: {type: String},
    projectId: {type:String},
    projectType: {type:String},
    assignee: {type: String, optional:true}
}]);

Tasks.attachSchema(Tasks.schema);

Tasks.methods = {};
Tasks.methods.addTask = new ValidatedMethod({
    name: 'Tasks.methods.addTask',

    validate: new SimpleSchema({
        description: {type: String},
        conversationId: {type: String}
    }).validator(),

    run({description, conversationId}) {
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

        var messageId = -1;
        var messageSeq = -1;
        var key = -1;
        if(Meteor.isServer) {
          key = incrementCounter('counters', conversationId);
          console.log('-- saving activity message for task key ' + key);
          var message = Ols.Message.systemSuccessMessage(conversationId,
              Meteor.user().username + " added task " + key + ": " + description);

          messageId = message._id;
          messageSeq = message.seq;
        }



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
            messageSeq: messageSeq,
            projectId: -1,
            projectType: Ols.PROJECT_TYPE_CONVERSATION_DEFAULT,
            conversationId: conversationId,
            key: key
        };
        var taskId = Tasks.insert(task);
        task._id = taskId;
        console.log("-- task " + task.key + " saved as task " + task._id + ".");

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

Tasks.methods.updateTaskAssignee = new ValidatedMethod({
    name: 'Tasks.methods.updateTaskAssignee',

    validate: new SimpleSchema({
        conversationId: {type: String},
        key: {type: Number},
        assignee: {type: String}
    }).validator(),

    run({conversationId, key, assignee}) {
        var task = Tasks.findOne({conversationId: conversationId, key: key});
        if(task == null) {
            throw new Meteor.Error("Tasks.methods.updateTaskAssignee.not-exist", "Task " + key + " doesn't exist");
        }
        Tasks.update({conversationId, key}, {$set: {assignee: assignee}});

        return task;
    }
});

Tasks.methods.archiveTask = new ValidatedMethod({
    name: 'Tasks.methods.archiveTask',

    validate: new SimpleSchema({
        conversationId: {type: String},
        key: {type: Number}
    }).validator(),

    run({conversationId, key}) {
        var task = Tasks.findOne({conversationId: conversationId, key: key});
        if(task == null) {
            throw new Meteor.Error("Tasks.methods.archiveTask.not-exist", "Task " + key + " doesn't exist");
        }
        Tasks.update({conversationId, key}, {$set: {isArchived: true}});

        return task;
    }
});

Tasks.methods.restoreTask = new ValidatedMethod({
    name: 'Tasks.methods.restoreTask',

    validate: new SimpleSchema({
        conversationId: {type: String},
        key: {type: Number}
    }).validator(),

    run({conversationId, key}) {
        var task = Tasks.findOne({conversationId: conversationId, key: key});
        if(task == null) {
            throw new Meteor.Error("Tasks.methods.restoreTask.not-exist", "Task " + key + " doesn't exist");
        }
        Tasks.update({conversationId, key}, {$set: {isArchived: false}});

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
