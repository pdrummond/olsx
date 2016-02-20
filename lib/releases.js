
Releases.schema = new SimpleSchema([BaseSchema, {
    title: {type: String},
    description: {type:String, optional:true},
    projectId: {type:String},
    projectKey: {type:String},
    type: {type: String},
    status: {type: String},
    isArchived: {type: String},
    versionString: {type: String, optional:true},
    seq: {type: String}
}]);

Releases.attachSchema(Releases.schema);

Releases.methods = {};
Releases.methods.addRelease = new ValidatedMethod({
    name: 'Releases.methods.addRelease',
    validate: new SimpleSchema({
        title: {type: String},
        projectId: {type:String}
    }).validator(),
    run({title, projectId}) {
        if (!this.userId) {
            throw new Meteor.Error("Releases.methods.addRelease.not-authenticated");
        }

        var project = Projects.findOne(projectId);
        if (project == null) {
            throw new Meteor.Error("Releases.methods.addRelease.project-not-exist", "Project " + projectId + " does not exist");
        }

        var userId = Meteor.userId();
        var username = Meteor.user().username;

        var now = new Date();
        var release = {
            title: title,
            projectId,
            projectKey: project.key,
            type: Ols.Release.RELEASE_TYPE_STANDARD,
            status: Ols.Release.RELEASE_STATUS_OPEN,
            createdAt: now,
            updatedAt: now,
            createdBy: userId,
            updatedBy: userId,
            createdByName: username,
            updatedByName: username,
            seq: Ols.Counter.getProjectCounter(projectId),
            isArchived: false
        };

        var releaseId = Releases.insert(release);
        console.log('>> added release ' + releaseId);
        release._id = releaseId;

        Ols.Message.systemSuccessMessage(release.projectId, Meteor.user().username + " added release " + release.projectKey + "-" + release.seq + ":" + release.title);

        return release;
    }
});

Releases.methods.removeRelease = new ValidatedMethod({
    name: 'Releases.methods.removeRelease',
    validate: new SimpleSchema({
        releaseId: {type: String}
    }).validator(),

    run({releaseId}) {
        if (!this.userId) {
            throw new Meteor.Error("Releases.methods.removeRelease.not-authenticated");
        }
        var release = Releases.findOne(releaseId);
        if (release == null) {
            throw new Meteor.Error("Releases.methods.removeRelease.release-not-exist", "Release " + releaseId + " does not exist");
        }
        Releases.remove(releaseId);
        Ols.Message.systemSuccessMessage(release.projectId, Meteor.user().username + " removed release " + release.projectKey + "-" + release.seq + ":" + release.title);
    }
});

Releases.methods.setTitle = new ValidatedMethod({
    name: 'Releases.methods.setTitle',

    validate: new SimpleSchema({
        releaseId: {type: String},
        title: {type: String}
    }).validator(),

    run({releaseId, title}) {
        var release = Releases.findOne(releaseId);
        Releases.update(releaseId, {
            $set: {title: title, updatedAt: new Date()},
        });
        Ols.Message.systemSuccessMessage(release.projectId, Meteor.user().username + " renamed release " + release.projectKey + "-" + release.seq + " to " + title);

    }
});

Releases.methods.setDescription = new ValidatedMethod({
    name: 'Releases.methods.setDescription',

    validate: new SimpleSchema({
        releaseId: {type: String},
        description: {type: String}
    }).validator(),

    run({releaseId, description}) {
        var release = Releases.findOne(releaseId);
        Releases.update(releaseId, {
            $set: {description: description, updatedAt: new Date()},
        });
        Ols.Message.systemSuccessMessage(release.projectId, Meteor.user().username + " updated the description for release " + release.projectKey + "-" + release.seq + " to " + Ols.StringUtils.truncate(description, 200));
    }
});

