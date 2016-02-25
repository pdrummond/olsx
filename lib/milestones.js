
Milestones.schema = new SimpleSchema([BaseSchema, {
    title: {type: String},
    description: {type:String, optional:true},
    projectId: {type:String},
    projectKey: {type:String},
    releaseId: {type:String, optional:true},
    type: {type: String},
    due: {type: Date, optional:true},
    seq: {type: String},
    isActive: {type:Boolean}
}]);

Milestones.attachSchema(Milestones.schema);

Milestones.methods = {};
Milestones.methods.addMilestone = new ValidatedMethod({
    name: 'Milestones.methods.addMilestone',
    validate: new SimpleSchema({
        title: {type: String},
        projectId: {type:String},
        releaseId: {type:String, optional:true}
    }).validator(),
    run({title, projectId, releaseId}) {
        if (!this.userId) {
            throw new Meteor.Error("Milestones.methods.addMilestone.not-authenticated");
        }

        var project = Projects.findOne(projectId);
        if (project == null) {
            throw new Meteor.Error("Milestones.methods.addMilestone.project-not-exist", "Project " + projectId + " does not exist");
        }

        var userId = Meteor.userId();
        var username = Meteor.user().username;

        var now = new Date();
        var milestone = {
            title: title,
            projectId,
            projectKey: project.key,
            type: Ols.Milestone.MILESTONE_TYPE_STANDARD,
            createdAt: now,
            updatedAt: now,
            createdBy: userId,
            updatedBy: userId,
            createdByName: username,
            updatedByName: username,
            seq: Ols.Counter.getProjectCounter(projectId),
            isActive:true,
            releaseId,
        };

        var milestoneId = Milestones.insert(milestone);
        console.log('>> added milestone ' + milestoneId);
        milestone._id = milestoneId;

        Ols.Message.systemSuccessMessage(milestone.projectId, Meteor.user().username + " added milestone " + milestone.projectKey + "-" + milestone.seq + ":" + milestone.title);

        return milestone;
    }
});

Milestones.methods.removeMilestone = new ValidatedMethod({
    name: 'Milestones.methods.removeMilestone',
    validate: new SimpleSchema({
        milestoneId: {type: String}
    }).validator(),

    run({milestoneId}) {
        if (!this.userId) {
            throw new Meteor.Error("Milestones.methods.removeMilestone.not-authenticated");
        }
        var milestone = Milestones.findOne(milestoneId);
        if (milestone == null) {
            throw new Meteor.Error("Milestones.methods.removeMilestone.milestone-not-exist", "Milestone " + milestoneId + " does not exist");
        }
        Milestones.remove(milestoneId);
        Ols.Message.systemSuccessMessage(milestone.projectId, Meteor.user().username + " removed milestone " + milestone.projectKey + "-" + milestone.seq + ":" + milestone.title);
    }
});


Milestones.methods.setTitle = new ValidatedMethod({
    name: 'Milestones.methods.setTitle',

    validate: new SimpleSchema({
        milestoneId: {type: String},
        title: {type: String}
    }).validator(),

    run({milestoneId, title}) {
        var milestone = Milestones.findOne(milestoneId);
        Milestones.update(milestoneId, {
            $set: {title: title, updatedAt: new Date()},
        });
        Ols.Message.systemSuccessMessage(milestone.projectId, Meteor.user().username + " renamed milestone " + milestone.projectKey + "-" + milestone.seq + " to " + title);

    }
});

Milestones.methods.setActive = new ValidatedMethod({
    name: 'Milestones.methods.setActive',

    validate: new SimpleSchema({
        milestoneId: {type: String},
        isActive: {type: Boolean}
    }).validator(),

    run({milestoneId, isActive}) {
        var milestone = Milestones.findOne(milestoneId);
        Milestones.update(milestoneId, {
            $set: {isActive: isActive, updatedAt: new Date()}
        });
    }
});

Milestones.methods.addMilestoneToRelease = new ValidatedMethod({
    name: 'Milestones.methods.addMilestoneToRelease',

    validate: new SimpleSchema({
        milestoneId: {type: String},
        releaseId: {type: String}
    }).validator(),

    run({milestoneId, releaseId}) {
        var milestone = Milestones.findOne(milestoneId);
        if(milestone== null) {
            throw new Meteor.Error("Milestones.methods.addMilestoneToRelease.milestone-not-exist", "Milestone " + milestoneId + " doesn't exist");
        }
        var release = Releases.findOne(releaseId);
        if(release == null) {
            throw new Meteor.Error("Milestones.methods.addMilestoneToRelease.release-not-exist", "Release " + releaseId + " doesn't exist");
        }
        Milestones.update(milestoneId, {$set: {releaseId, updatedAt: new Date()}});

        Ols.Message.systemSuccessMessage(milestone.projectId, Meteor.user().username + " added milestone " + milestone.projectKey + "-" + milestone.seq + " to release " + release.title);

        return milestone;
    }
});

Milestones.methods.setDescription = new ValidatedMethod({
    name: 'Milestones.methods.setDescription',

    validate: new SimpleSchema({
        milestoneId: {type: String},
        description: {type: String}
    }).validator(),

    run({milestoneId, description}) {
        var milestone = Milestones.findOne(milestoneId);
        Milestones.update(milestoneId, {
            $set: {description: description, updatedAt: new Date()}
        });
        Ols.Message.systemSuccessMessage(milestone.projectId, Meteor.user().username + " updated the description for milestone " + milestone.projectKey + "-" + milestone.seq + " to " + Ols.StringUtils.truncate(description, 200));
    }
});
