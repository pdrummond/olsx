
Items.schema = new SimpleSchema([BaseSchema, {
    description: {type: String},
    type: {type: String},
    subType: {type: String},
    status: {type: Number},
    isArchived: {type: Boolean},
    seq: {type: Number},
    messageId: {type: String},
    messageSeq: {type: Number},
    projectId: {type: String},
    projectKey: {type: String},
    assignee: {type: String, optional:true}
}]);

Items.attachSchema(Items.schema);

Items.methods = {};
Items.methods.addItem = new ValidatedMethod({
    name: 'Items.methods.addItem',

    validate: new SimpleSchema({
        description: {type: String},
        projectId: {type: String},
        type: {type:String},
        subType: {type:String}
    }).validator(),

    run({description, projectId, type, subType}) {
        console.log('-- adding item to project ' + projectId + " with description: '" + description + "'");
        if (!this.userId) {
            console.error('-- user ' + Meteor.user().username + ' is not authorised to add item to this project');
            throw new Meteor.Error("Items.methods.addItem.not-authorized");
        }

        var project = Projects.findOne(projectId);

        if (project == null) {
            console.error('-- Cannot find project with id ' + projectId);
            throw Meteor.Error(
                'Items.methods.addItem.invalid-project-id',
                'Error adding item - invalid project ID: ' + projectId
            );
        }

        var messageId = -1;
        var messageSeq = -1;
        var seq = -1;
        if(Meteor.isServer) {
          seq = incrementCounter('counters', "project-counter-" + projectId);
          console.log('-- saving activity message for item seq ' + seq);
          var message = Ols.Message.systemSuccessMessage(projectId, Meteor.user().username + " added " + subType + " " + seq + ": " + description);
          messageId = message._id;
          messageSeq = message.seq;
        }

        console.log('-- saving item ' + seq);
        var now = new Date();
        var item = {
            description:description,
            type: type,
            subType: subType,
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
            projectKey: project.key,
            seq: seq
        };
        var itemId = Items.insert(item);
        item._id = itemId;
        console.log("-- item " + item.seq + " saved as item " + item._id + ".");

        return item;
    }
});

Items.methods.updateItemStatus = new ValidatedMethod({
    name: 'Items.methods.updateItemStatus',

    validate: new SimpleSchema({
        projectId: {type: String},
        key: {type: Number},
        status: {type: Number}
    }).validator(),

    run({projectId, key, status}) {
        var item = Items.findOne({projectId: projectId, key: key});
        if(item == null) {
            throw new Meteor.Error("Items.methods.updateItemStatus.not-exist", "Item " + key + " doesn't exist");
        }
        Items.update({projectId, key}, {$set: {status: status}});

        return item;
    }
});

Items.methods.updateItemAssignee = new ValidatedMethod({
    name: 'Items.methods.updateItemAssignee',

    validate: new SimpleSchema({
        projectId: {type: String},
        key: {type: Number},
        assignee: {type: String}
    }).validator(),

    run({projectId, key, assignee}) {
        var item = Items.findOne({projectId: projectId, key: key});
        if(item == null) {
            throw new Meteor.Error("Items.methods.updateItemAssignee.not-exist", "Item " + key + " doesn't exist");
        }
        Items.update({projectId, key}, {$set: {assignee: assignee}});

        return item;
    }
});

Items.methods.archiveItem = new ValidatedMethod({
    name: 'Items.methods.archiveItem',

    validate: new SimpleSchema({
        projectId: {type: String},
        key: {type: Number}
    }).validator(),

    run({projectId, key}) {
        var item = Items.findOne({projectId: projectId, key: key});
        if(item == null) {
            throw new Meteor.Error("Items.methods.archiveItem.not-exist", "Item " + key + " doesn't exist");
        }
        Items.update({projectId, key}, {$set: {isArchived: true}});

        return item;
    }
});

Items.methods.restoreItem = new ValidatedMethod({
    name: 'Items.methods.restoreItem',

    validate: new SimpleSchema({
        projectId: {type: String},
        key: {type: Number}
    }).validator(),

    run({projectId, key}) {
        var item = Items.findOne({projectId: projectId, key: key});
        if(item == null) {
            throw new Meteor.Error("Items.methods.restoreItem.not-exist", "Item " + key + " doesn't exist");
        }
        Items.update({projectId, key}, {$set: {isArchived: false}});

        return item;
    }
});

Items.methods.removeItem = new ValidatedMethod({
    name: 'Items.methods.removeItem',

    validate: new SimpleSchema({
        projectId: {type: String},
        key: {type: Number}
    }).validator(),

    run({projectId, key}) {
        console.log("> removeItem(projectId=" + projectId + ", key=" + key + ")");
        if (!this.userId) {
            throw new Meteor.Error("Items.methods.removeItem.not-authorized");
        }
        var item = Items.findOne({projectId:projectId, key: key});
        if(item == null) {
            throw new Meteor.Error("Items.methods.removeItem.not-exist", "Item " + key + " doesn't exist");
        }
        console.log("-- Removing item " + key  + " from project " + projectId);

        var result = Items.remove({projectId: projectId, key: key});
        console.log("-- Remove result is " + result);
        console.log("< removeItem");
    }
});
