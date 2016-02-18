
Tasks.schema = new SimpleSchema([BaseSchema, {
    description: {type: String},
    status: {type: Number},
    isArchived: {type: Boolean},
    key: {type: Number},
    messageId: {type: String},
    messageSeq: {type: Number},
    projectId: {type: String},
    projectId: {type:String},
    assignee: {type: String, optional:true}
}]);

Tasks.attachSchema(Tasks.schema);

Tasks.methods = {};
Tasks.methods.addTask = new ValidatedMethod({
    name: 'Tasks.methods.addTask',

    validate: new SimpleSchema({
        description: {type: String},
        projectId: {type: String}
    }).validator(),

    run({description, projectId}) {
        console.log('-- adding task to project ' + projectId + " with description: '" + description + "'");
        if (!this.userId) {
            console.error('-- user ' + Meteor.user().username + ' is not authorised to add task to this project');
            throw new Meteor.Error("Tasks.methods.addTask.not-authorized");
        }

        var project = Projects.findOne(projectId);

        if (project == null) {
            console.error('-- Cannot find project with id ' + projectId);
            throw Meteor.Error(
                'Tasks.methods.addTask.invalid-project-id',
                'Error adding task - invalid project ID: ' + projectId
            );
        }

        var messageId = -1;
        var messageSeq = -1;
        var key = -1;
        if(Meteor.isServer) {
          key = incrementCounter('counters', projectId);
          console.log('-- saving activity message for task key ' + key);
          var message = Ols.Message.systemSuccessMessage(projectId,
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
            projectId: projectId,
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
        projectId: {type: String},
        key: {type: Number},
        status: {type: Number}
    }).validator(),

    run({projectId, key, status}) {
        var task = Tasks.findOne({projectId: projectId, key: key});
        if(task == null) {
            throw new Meteor.Error("Tasks.methods.updateTaskStatus.not-exist", "Task " + key + " doesn't exist");
        }
        Tasks.update({projectId, key}, {$set: {status: status}});

        return task;
    }
});

Tasks.methods.updateTaskAssignee = new ValidatedMethod({
    name: 'Tasks.methods.updateTaskAssignee',

    validate: new SimpleSchema({
        projectId: {type: String},
        key: {type: Number},
        assignee: {type: String}
    }).validator(),

    run({projectId, key, assignee}) {
        var task = Tasks.findOne({projectId: projectId, key: key});
        if(task == null) {
            throw new Meteor.Error("Tasks.methods.updateTaskAssignee.not-exist", "Task " + key + " doesn't exist");
        }
        Tasks.update({projectId, key}, {$set: {assignee: assignee}});

        return task;
    }
});

Tasks.methods.archiveTask = new ValidatedMethod({
    name: 'Tasks.methods.archiveTask',

    validate: new SimpleSchema({
        projectId: {type: String},
        key: {type: Number}
    }).validator(),

    run({projectId, key}) {
        var task = Tasks.findOne({projectId: projectId, key: key});
        if(task == null) {
            throw new Meteor.Error("Tasks.methods.archiveTask.not-exist", "Task " + key + " doesn't exist");
        }
        Tasks.update({projectId, key}, {$set: {isArchived: true}});

        return task;
    }
});

Tasks.methods.restoreTask = new ValidatedMethod({
    name: 'Tasks.methods.restoreTask',

    validate: new SimpleSchema({
        projectId: {type: String},
        key: {type: Number}
    }).validator(),

    run({projectId, key}) {
        var task = Tasks.findOne({projectId: projectId, key: key});
        if(task == null) {
            throw new Meteor.Error("Tasks.methods.restoreTask.not-exist", "Task " + key + " doesn't exist");
        }
        Tasks.update({projectId, key}, {$set: {isArchived: false}});

        return task;
    }
});

Tasks.methods.removeTask = new ValidatedMethod({
    name: 'Tasks.methods.removeTask',

    validate: new SimpleSchema({
        projectId: {type: String},
        key: {type: Number}
    }).validator(),

    run({projectId, key}) {
        console.log("> removeTask(projectId=" + projectId + ", key=" + key + ")");
        if (!this.userId) {
            throw new Meteor.Error("Tasks.methods.removeTask.not-authorized");
        }
        var task = Tasks.findOne({projectId:projectId, key: key});
        if(task == null) {
            throw new Meteor.Error("Tasks.methods.removeTask.not-exist", "Task " + key + " doesn't exist");
        }
        console.log("-- Removing task " + key  + " from project " + projectId);

        var result = Tasks.remove({projectId: projectId, key: key});
        console.log("-- Remove result is " + result);
        console.log("< removeTask");
    }
});
