
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
    assignee: {type: String, optional:true},
    milestoneId: {type: String, optional:true},
    priority: {type:Number, optional:true}
}]);

Items.attachSchema(Items.schema);

Items.methods = {};
Items.methods.addItem = new ValidatedMethod({
    name: 'Items.methods.addItem',

    validate: new SimpleSchema({
        description: {type: String},
        projectId: {type: String},
        type: {type:String},
        subType: {type:String},
        milestoneId: {type:String, optional:true}
    }).validator(),

    run({description, projectId, type, subType, milestoneId}) {
        console.log('-- adding item to project ' + projectId + " with description: '" + description + "'");
        if (!this.userId) {
            console.error('-- user ' + Meteor.user().username + ' is not authenticated to add item to this project');
            throw new Meteor.Error("Items.methods.addItem.not-authenticated");
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
          seq = Ols.Counter.getProjectCounter(projectId);
          console.log('-- saving activity message for item seq ' + seq);
          var message = Ols.Message.systemSuccessMessage(projectId, Meteor.user().username + " added " + subType + " " + project.key + "-" + seq + ": " + description);
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
            milestoneId: milestoneId,
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
        seq: {type: Number},
        status: {type: Number}
    }).validator(),

    run({projectId, seq, status}) {
        var item = Items.findOne({projectId: projectId, seq: seq});
        if(item == null) {
            throw new Meteor.Error("Items.methods.updateItemStatus.not-exist", "Item " + seq + " doesn't exist");
        }
        Items.update({projectId, seq}, {$set: {status: status, updatedAt: new Date()}});

        if(status == Ols.Status.DONE) {
            Ols.Message.systemSuccessMessage(projectId, Meteor.user().username + " completed " + item.subType + " " + item.projectKey + "-" + item.seq);
        } else {
            Ols.Message.systemSuccessMessage(projectId, Meteor.user().username + " changed status of " + item.subType + " " + item.projectKey + "-" + item.seq + " to " + Ols.Status.getStatusLabel(status));
        }

        return item;
    }
});

Items.methods.updateItemPriority = new ValidatedMethod({
    name: 'Items.methods.updateItemPriority',

    validate: new SimpleSchema({
        itemId: {type: String},
        priority: {type: Number}
    }).validator(),

    run({itemId, priority}) {
        var item = Items.findOne(itemId);
        if(item == null) {
            throw new Meteor.Error("Items.methods.updateItemPriority.not-exist", "Item " + seq + " doesn't exist");
        }
        Items.update(itemId, {$set: {priority: priority, updatedAt: new Date}});

        Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " set priority of " + item.subType + " " + item.projectKey + "-" + item.seq + " to " + priority);

        return item;
    }
});


Items.methods.updateItemType = new ValidatedMethod({
    name: 'Items.methods.updateItemType',

    validate: new SimpleSchema({
        itemId: {type: String},
        type: {type: String},
        subType: {type: String}
    }).validator(),

    run({itemId, type, subType}) {
        var item = Items.findOne(itemId);
        if(item == null) {
            throw new Meteor.Error("Items.methods.updateItemType.not-exist", "Item " + seq + " doesn't exist");
        }
        Items.update(itemId, {$set: {type: type, subType: subType, updatedAt: new Date}});

        Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " changed " + item.projectKey + "-" + item.seq + " from " + item.subType + " to " + subType);

        return item;
    }
});

Items.methods.removeItemPriority = new ValidatedMethod({
    name: 'Items.methods.removeItemPriority',

    validate: new SimpleSchema({
        itemId: {type: String}
    }).validator(),

    run({itemId}) {
        var item = Items.findOne(itemId);
        if(item == null) {
            throw new Meteor.Error("Items.methods.removeItemPriority.not-exist", "Item " + seq + " doesn't exist");
        }
        Items.update(itemId, {
            $unset: {priority: ''},
            $set: {updatedAt: new Date}
        });

        Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " removed priority from " + item.subType + " " + item.projectKey + "-" + item.seq);

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
        seq: {type: Number}
    }).validator(),

    run({projectId, seq}) {
        var item = Items.findOne({projectId: projectId, seq: seq});
        if(item == null) {
            throw new Meteor.Error("Items.methods.archiveItem.not-exist", "Item " + seq + " doesn't exist");
        }
        Items.update({projectId, seq}, {$set: {isArchived: true}});

        Ols.Message.systemSuccessMessage(projectId, Meteor.user().username + " archived " + item.subType + " " + item.projectKey + "-" + item.seq);

        return item;
    }
});

Items.methods.restoreItem = new ValidatedMethod({
    name: 'Items.methods.restoreItem',

    validate: new SimpleSchema({
        projectId: {type: String},
        seq: {type: Number}
    }).validator(),

    run({projectId, seq}) {
        var item = Items.findOne({projectId: projectId, seq: seq});
        if(item == null) {
            throw new Meteor.Error("Items.methods.restoreItem.not-exist", "Item " + seq + " doesn't exist");
        }
        Items.update({projectId, seq}, {$set: {isArchived: false}});
        Ols.Message.systemSuccessMessage(projectId, Meteor.user().username + " restored " + item.subType + " " + item.projectKey + "-" + item.seq);

        return item;
    }
});

Items.methods.addItemToMilestone = new ValidatedMethod({
    name: 'Items.methods.addItemToMilestone',

    validate: new SimpleSchema({
        itemId: {type: String},
        milestoneId: {type: String}
    }).validator(),

    run({itemId, milestoneId}) {
        var item = Items.findOne(itemId);
        if(item== null) {
            throw new Meteor.Error("Items.methods.addItemToMilestone.item-not-exist", "Item " + itemId + " doesn't exist");
        }
        var milestone = Milestones.findOne(milestoneId);
        if(milestone == null) {
            throw new Meteor.Error("Items.methods.addItemToMilestone.milestone-not-exist", "Milestone " + milestoneId + " doesn't exist");
        }
        Items.update(itemId, {$set: {milestoneId, updatedAt: new Date()}});

        Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " added " + item.subType + " " + item.projectKey + "-" + item.seq + " to milestone " + milestone.title);

        return item;
    }
});

Items.methods.moveItemToBacklog = new ValidatedMethod({
    name: 'Items.methods.moveItemToBacklog',

    validate: new SimpleSchema({
        itemId: {type: String},
    }).validator(),

    run({itemId}) {
        var item = Items.findOne(itemId);
        if(item== null) {
            throw new Meteor.Error("Items.methods.moveItemToBacklog.item-not-exist", "Item " + itemId + " doesn't exist");
        }
        Items.update(itemId, {
            $unset: { milestoneId : "" },
            $set: {updatedAt: new Date()}
        });
        Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " has moved " + item.subType + " " + item.projectKey + "-" + item.seq + " to the backlog");
        return item;
    }
});

Items.methods.removeItem = new ValidatedMethod({
    name: 'Items.methods.removeItem',
    validate: new SimpleSchema({
        itemId: {type: String}
    }).validator(),

    run({itemId}) {
        if (!this.userId) {
            throw new Meteor.Error("Items.methods.removeItem.not-authenticated");
        }
        var item = Items.findOne(itemId);
        if (item == null) {
            throw new Meteor.Error("Items.methods.removeItem.item-not-exist", "Item " + itemId + " does not exist");
        }
        Items.remove(itemId);
        Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " deleted " + item.subType + " " + item.projectKey + "-" + item.seq);
    }
});

Items.methods.setTitle = new ValidatedMethod({
    name: 'Items.methods.setTitle',

    validate: new SimpleSchema({
        itemId: {type: String},
        title: {type: String}
    }).validator(),

    run({itemId, title}) {
        var item = Items.findOne(itemId);
        Items.update(itemId, {
            $set: {description: title, updatedAt: new Date()}
        });
        Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " renamed " + item.subType + " " + item.projectKey + "-" + item.seq + " to '" + title + "'");
    }
});
