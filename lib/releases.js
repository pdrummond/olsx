
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

        if(Meteor.isServer) {
            Ols.Activity.addActivity({
                projectId: release.projectId,
                itemId: releaseId,
                type: Ols.ActivityType.ACTIVITY_TYPE_RELEASE,
                longDescription: " added release **" + release.title + "**"
            });
        }

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

        if(Meteor.isServer) {
            Ols.Activity.addActivity({
                projectId: release.projectId,
                itemId: releaseId,
                type: Ols.ActivityType.ACTIVITY_TYPE_RELEASE,
                longDescription: " deleted release **" + release.title + "**"
            });
        }
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

        if(Meteor.isServer) {
            Ols.Activity.addActivity({
                projectId: release.projectId,
                itemId: releaseId,
                type: Ols.ActivityType.ACTIVITY_TYPE_RELEASE,
                longDescription: ' renamed release **' + release.title + '** to **' + title + '**'
            });
        }

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

        if(Meteor.isServer) {
            Ols.Activity.addActivity({
                projectId: release.projectId,
                itemId: releaseId,
                type: Ols.ActivityType.ACTIVITY_TYPE_RELEASE,
                longDescription: " updated description for release **" + release.title + "** to: \n\n> " + Ols.StringUtils.truncate(description, 200)
            });
        }

    }
});
