
Items.schema = new SimpleSchema([BaseSchema, {
    description: {type: String}, //TODO: Rename this at some point to title
    content: {type: String}, //TODO: Rename this at some point to description
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
        type: {type: String},
        subType: {type: String},
        status: {type: Number},
        assignee: {type: String, optional:true},
        milestoneId: {type:String, optional:true}
    }).validator(),

    run({description, projectId, type, subType, assignee, milestoneId, status}) {
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
        var itemAddedSystemMessage = null;
        if(Meteor.isServer) {
          seq = Ols.Counter.getProjectCounter(projectId);
          console.log('-- saving activity message for item seq ' + seq);
          itemAddedSystemMessage = Ols.Message.systemSuccessMessage(projectId, Meteor.user().username + " added " + subType + " " + project.key + "-" + seq + ": " + description);
          messageId = itemAddedSystemMessage._id;
          messageSeq = itemAddedSystemMessage.seq;
        }

        console.log('-- saving item ' + seq);
        var now = new Date();
        var item = {
            description:description,
            type: type,
            subType: subType,
            status: status,
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
            assignee: assignee,
            milestoneId: milestoneId,
            projectKey: project.key,
            seq: seq
        };
        var itemId = Items.insert(item);
        item._id = itemId;
        console.log("-- item " + item.seq + " saved as item " + item._id + ".");

        if(Meteor.isServer && itemAddedSystemMessage != null) {
            Meteor.call('addActivityMessage', (Meteor.user().username + " added this " + item.subType), projectId, itemAddedSystemMessage._id, itemAddedSystemMessage.seq, itemId);
        }

        return item;
    }
});

Items.methods.updateItemStatus = new ValidatedMethod({
    name: 'Items.methods.updateItemStatus',

    validate: new SimpleSchema({
        itemId: {type: String},
        status: {type: Number}
    }).validator(),

    run({itemId, status}) {
        if (!this.userId) {
            throw new Meteor.Error("Items.methods.updateItemStatus.not-authenticated");
        }

        var item = Items.findOne(itemId);
        if(item == null) {
            throw new Meteor.Error("Items.methods.updateItemStatus.not-exist", "Item " + itemId + " doesn't exist");
        }
        Items.update(itemId, {$set: {status: status, updatedAt: new Date()}});

        console.log("UPDATE ITEM STATUS: item subType is " + item.subType);
        if(item.subType == Ols.Item.INFO_SUBTYPE_QUESTION) {
            if (Ols.QuestionStatus.isClosed(status)) {
                var sysMsg = Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " closed " + item.subType + " " + item.projectKey + "-" + item.seq + " as " + Ols.QuestionStatus.getStatusLabel(status));
                if(Meteor.isServer) {
                    Meteor.call('addActivityMessage', (Meteor.user().username + " set status to " + Ols.QuestionStatus.getStatusLabel(status)), item.projectId, sysMsg._id, sysMsg.seq, item._id);
                }
            } else {
                var sysMsg = Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " changed status of " + item.subType + " " + item.projectKey + "-" + item.seq + " to " + Ols.QuestionStatus.getStatusLabel(status));
                if(Meteor.isServer) {
                    Meteor.call('addActivityMessage', (Meteor.user().username + " set status to " + Ols.QuestionStatus.getStatusLabel(status)), item.projectId, sysMsg._id, sysMsg.seq, item._id);
                }
            }
        } else {
            if (Ols.Status.isDone(status)) {
                var sysMsg = Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " closed " + item.subType + " " + item.projectKey + "-" + item.seq + " as " + Ols.Status.getStatusLabel(status));
                if(Meteor.isServer) {
                    Meteor.call('addActivityMessage', (Meteor.user().username + " set status to " + Ols.Status.getStatusLabel(status)), item.projectId, sysMsg._id, sysMsg.seq, item._id);
                }
            } else {
                var sysMsg = Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " changed status of " + item.subType + " " + item.projectKey + "-" + item.seq + " to " + Ols.Status.getStatusLabel(status));
                if(Meteor.isServer) {
                    Meteor.call('addActivityMessage', (Meteor.user().username + " set status to " + Ols.Status.getStatusLabel(status)), item.projectId, sysMsg._id, sysMsg.seq, item._id);
                }
            }
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
        if (!this.userId) {
            throw new Meteor.Error("Items.methods.updateItemPriority.not-authenticated");
        }
        var item = Items.findOne(itemId);
        if(item == null) {
            throw new Meteor.Error("Items.methods.updateItemPriority.not-exist", "Item " + seq + " doesn't exist");
        }
        Items.update(itemId, {$set: {priority: priority, updatedAt: new Date}});

        var sysMsg = Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " set priority of " + item.subType + " " + item.projectKey + "-" + item.seq + " to " + priority);
        if(Meteor.isServer) {
            Meteor.call('addActivityMessage', (Meteor.user().username + " set priority to " + priority), item.projectId, sysMsg._id, sysMsg.seq, item._id);
        }

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
        if (!this.userId) {
            throw new Meteor.Error("Items.methods.updateItemType.not-authenticated");
        }
        var item = Items.findOne(itemId);
        if(item == null) {
            throw new Meteor.Error("Items.methods.updateItemType.not-exist", "Item " + seq + " doesn't exist");
        }
        Items.update(itemId, {$set: {type: type, subType: subType, updatedAt: new Date}});

        var sysMsg = Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " changed " + item.projectKey + "-" + item.seq + " from " + item.subType + " to " + subType);
        if(Meteor.isServer) {
            Meteor.call('addActivityMessage', (Meteor.user().username + " changed type to " + subType), item.projectId, sysMsg._id, sysMsg.seq, item._id);
        }
        return item;
    }
});

Items.methods.removeItemPriority = new ValidatedMethod({
    name: 'Items.methods.removeItemPriority',

    validate: new SimpleSchema({
        itemId: {type: String}
    }).validator(),

    run({itemId}) {
        if (!this.userId) {
            throw new Meteor.Error("Items.methods.removeItemPriority.not-authenticated");
        }
        var item = Items.findOne(itemId);
        if(item == null) {
            throw new Meteor.Error("Items.methods.removeItemPriority.not-exist", "Item " + seq + " doesn't exist");
        }
        Items.update(itemId, {
            $unset: {priority: ''},
            $set: {updatedAt: new Date}
        });

        var sysMsg = Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " removed priority from " + item.subType + " " + item.projectKey + "-" + item.seq);
        if(Meteor.isServer) {
            Meteor.call('addActivityMessage', (Meteor.user().username + " removed priority value"), item.projectId, sysMsg._id, sysMsg.seq, item._id);
        }
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
        if (!this.userId) {
            throw new Meteor.Error("Items.methods.archiveItem.not-authenticated");
        }
        var item = Items.findOne({projectId: projectId, seq: seq});
        if(item == null) {
            throw new Meteor.Error("Items.methods.archiveItem.not-exist", "Item " + seq + " doesn't exist");
        }
        Items.update({projectId, seq}, {$set: {isArchived: true}});

        var sysMsg = Ols.Message.systemSuccessMessage(projectId, Meteor.user().username + " archived " + item.subType + " " + item.projectKey + "-" + item.seq);
        if(Meteor.isServer) {
            Meteor.call('addActivityMessage', (Meteor.user().username + " archived this " + item.subType), item.projectId, sysMsg._id, sysMsg.seq, item._id);
        }
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
        if (!this.userId) {
            throw new Meteor.Error("Items.methods.restoreItem.not-authenticated");
        }
        var item = Items.findOne({projectId: projectId, seq: seq});
        if(item == null) {
            throw new Meteor.Error("Items.methods.restoreItem.not-exist", "Item " + seq + " doesn't exist");
        }
        Items.update({projectId, seq}, {$set: {isArchived: false}});
        var sysMsg = Ols.Message.systemSuccessMessage(projectId, Meteor.user().username + " restored " + item.subType + " " + item.projectKey + "-" + item.seq);
        if(Meteor.isServer) {
            Meteor.call('addActivityMessage', (Meteor.user().username + " restored this " + item.subType), item.projectId, sysMsg._id, sysMsg.seq, item._id);
        }
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
        if (!this.userId) {
            throw new Meteor.Error("Items.methods.addItemToMilestone.not-authenticated");
        }
        var item = Items.findOne(itemId);
        if(item== null) {
            throw new Meteor.Error("Items.methods.addItemToMilestone.item-not-exist", "Item " + itemId + " doesn't exist");
        }
        var milestone = Milestones.findOne(milestoneId);
        if(milestone == null) {
            throw new Meteor.Error("Items.methods.addItemToMilestone.milestone-not-exist", "Milestone " + milestoneId + " doesn't exist");
        }
        Items.update(itemId, {$set: {milestoneId, updatedAt: new Date()}});

        var sysMsg = Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " added " + item.subType + " " + item.projectKey + "-" + item.seq + " to milestone " + milestone.title);
        if(Meteor.isServer) {
            Meteor.call('addActivityMessage', (Meteor.user().username + " added this " + item.subType + " to milestone '" + milestone.title + "'"), item.projectId, sysMsg._id, sysMsg.seq, item._id);
        }
        return item;
    }
});

Items.methods.moveItemToBacklog = new ValidatedMethod({
    name: 'Items.methods.moveItemToBacklog',

    validate: new SimpleSchema({
        itemId: {type: String}
    }).validator(),

    run({itemId}) {
        if (!this.userId) {
            throw new Meteor.Error("Items.methods.moveItemToBacklog.not-authenticated");
        }
        var item = Items.findOne(itemId);
        if(item== null) {
            throw new Meteor.Error("Items.methods.moveItemToBacklog.item-not-exist", "Item " + itemId + " doesn't exist");
        }
        Items.update(itemId, {
            $unset: { milestoneId : "" },
            $set: {updatedAt: new Date()}
        });
        var sysMsg = Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " has moved " + item.subType + " " + item.projectKey + "-" + item.seq + " to the backlog");
        if(Meteor.isServer) {
            Meteor.call('addActivityMessage', (Meteor.user().username + " moved this " + item.subType + " to the backlog"), item.projectId, sysMsg._id, sysMsg.seq, item._id);
        }
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
        var sysMsg = Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " deleted " + item.subType + " " + item.projectKey + "-" + item.seq);
        if(Meteor.isServer) {
            Meteor.call('addActivityMessage', (Meteor.user().username + " deleted this " + item.subType), item.projectId, sysMsg._id, sysMsg.seq, item._id);
        }
    }
});

Items.methods.setTitle = new ValidatedMethod({
    name: 'Items.methods.setTitle',

    validate: new SimpleSchema({
        itemId: {type: String},
        title: {type: String}
    }).validator(),

    run({itemId, title}) {
        if (!this.userId) {
            throw new Meteor.Error("Items.methods.setTitle.not-authenticated");
        }
        var item = Items.findOne(itemId);
        Items.update(itemId, {
            $set: {description: title, updatedAt: new Date()}
        });
        var sysMsg = Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " renamed " + item.subType + " " + item.projectKey + "-" + item.seq + " to '" + title + "'");
        if(Meteor.isServer) {
            Meteor.call('addActivityMessage', (Meteor.user().username + " renamed this " + item.subType) + "to '" + title + "'", item.projectId, sysMsg._id, sysMsg.seq, item._id);
        }

    }
});

Items.methods.setDescription = new ValidatedMethod({
    name: 'Items.methods.setDescription',

    validate: new SimpleSchema({
        itemId: {type: String},
        description: {type: String}
    }).validator(),

    run({itemId, description}) {
        if (!this.userId) {
            throw new Meteor.Error("Items.methods.setDescription.not-authenticated");
        }
        var item = Items.findOne(itemId);
        Items.update(itemId, {
            $set: {content: description, updatedAt: new Date()}
        });
        var truncatedDesc = Ols.StringUtils.truncate(description, 200);
        var sysMsg = Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " set description for " + item.subType + " " + item.projectKey + "-" + item.seq + " to '" + truncatedDesc + "'");
        if(Meteor.isServer) {
            Meteor.call('addActivityMessage', (Meteor.user().username + " set the description for this " + item.subType) + "to '" + truncatedDesc + "'", item.projectId, sysMsg._id, sysMsg.seq, item._id);
        }

    }
});


Items.methods.setAssignee = new ValidatedMethod({
    name: 'Items.methods.setAssignee',

    validate: new SimpleSchema({
        itemId: {type: String},
        assignee: {type: String}
    }).validator(),

    run({itemId, assignee}) {
        if (!this.userId) {
            throw new Meteor.Error("Items.methods.setAssignee.not-authenticated");
        }
        var item = Items.findOne(itemId);

        var member = Members.findOne({username: assignee, projectId: item.projectId});
        if(member == null) {
            throw new Meteor.Error("Items.methods.setAssignee.user-not-member", assignee + " is not a member of this project.");
        }

        Items.update(itemId, {
            $set: {assignee: assignee, updatedAt: new Date()}
        });
        var sysMsg = Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " assigned " + item.subType + " " + item.projectKey + "-" + item.seq + " to " + assignee);
        if(Meteor.isServer) {
            Meteor.call('addActivityMessage', (Meteor.user().username + " assigned this " + item.subType) + " to " + assignee, item.projectId, sysMsg._id, sysMsg.seq, item._id);
        }
    }
});


Items.methods.removeAssignee = new ValidatedMethod({
    name: 'Items.methods.removeAssignee',

    validate: new SimpleSchema({
        itemId: {type: String}
    }).validator(),

    run({itemId}) {
        if (!this.userId) {
            throw new Meteor.Error("Items.methods.removeAssignee.not-authenticated");
        }
        var item = Items.findOne(itemId);
        var assignee = item.assignee;

        Items.update(itemId, {
            $set: {updatedAt: new Date()},
            $unset: {assignee: ''}
        });
        var sysMsg = Ols.Message.systemSuccessMessage(item.projectId, Meteor.user().username + " unassigned " + assignee + " from " + item.subType + " " + item.projectKey + "-" + item.seq);
        if(Meteor.isServer) {
            Meteor.call('addActivityMessage', (Meteor.user().username + " unassigned " + assignee + " from this " + item.subType), item.projectId, sysMsg._id, sysMsg.seq, item._id);
        }
    }
});

