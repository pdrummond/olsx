
Projects.schema = new SimpleSchema([BaseSchema, {
    title: {type: String},
    type: {type: String},
    template: {type: String},
    key: {type: String, optional:true},
    currentReleaseId: {type: String, optional:true},
    nextReleaseId: {type: String, optional:true},
    seenList: {type: [String]},
    theme: {type: String, optional:true}
}]);

Projects.attachSchema(Projects.schema);

Projects.methods = {};
Projects.methods.addProject = new ValidatedMethod({
    name: 'Projects.methods.addProject',
    validate: new SimpleSchema({
        type: {type: String},
        title: {type: String},
        key: {type: String, optional:true},
        template: {type:String, optional:true}
    }).validator(),
    run({type, title, key, template}) {
        if (!this.userId) {
            throw new Meteor.Error("Projects.methods.addProject.not-authenticated");
        }

        if(type == Ols.Project.PROJECT_TYPE_STANDARD && Projects.findOne({key}) != null) {
            throw new Meteor.Error("Projects.methods.addProject.key-is-not-unique", 'Project key "' + key + '" has already been taken.');
        }

        var userId = Meteor.userId();
        var username = Meteor.user().username;

        var now = new Date();
        var project = {
            title: title,
            type: type,
            template: template,
            key: key,
            createdAt: now,
            updatedAt: now,
            createdBy: userId,
            updatedBy: userId,
            createdByName: username,
            updatedByName: username,
            seenList: []
        };

        var projectId = Projects.insert(project);
        console.log('>> added project ' + projectId);
        project._id = projectId;

        var member = {
            userId: userId,
            username: username,
            projectId: projectId,
            role: Ols.Role.ROLE_ADMIN,
            createdAt: now,
            updatedAt: now,
            createdBy: userId,
            updatedBy: userId,
            createdByName: username,
            updatedByName: username
        };

        Members.insert(member);

        if(Meteor.isServer) {
            Ols.Activity.addActivity({
                projectId,
                itemId: projectId,
                type: Ols.ActivityType.ACTIVITY_TYPE_PROJECT,
                longDescription: " created this " + (type == Ols.Project.PROJECT_TYPE_STANDARD?"project":"conversation") + " using the " + template + " template"
            });
        }

        console.log("-- added project activity");

        return project;
    }
});

Projects.methods.setTitle = new ValidatedMethod({
    name: 'Projects.methods.setTitle',

    validate: new SimpleSchema({
        projectId: {type: String},
        title: {type: String}
    }).validator(),

    run({projectId, title}) {
        if (!this.userId) {
            throw new Meteor.Error("Projects.methods.setTitle.not-authenticated");
        }
        var project = Projects.findOne(projectId);

        var member = Members.findOne({userId: Meteor.userId(), projectId, role:Ols.Role.ROLE_ADMIN});
        if(member == null) {
            throw new Meteor.Error("Projects.methods.setTitle.not-authorised", "Only project admins can rename this project");
        }

        Projects.update(projectId, {
            $set: {title: title, updatedAt: new Date()}
        });

        if(Meteor.isServer) {
            Ols.Activity.addActivity({
                projectId,
                itemId: projectId,
                type: Ols.ActivityType.ACTIVITY_TYPE_PROJECT,
                longDescription: " renamed this " + (project.type == Ols.Project.PROJECT_TYPE_STANDARD?"project":"conversation") + " to **" + title + "**"
            });
        }
    }
});

Projects.methods.removeProject = new ValidatedMethod({
    name: 'Projects.methods.removeProject',
    validate: new SimpleSchema({
        projectId: {type: String}
    }).validator(),

    run({projectId}) {
        if (!this.userId) {
            throw new Meteor.Error("Projects.methods.removeProject.not-authenticated");
        }
        var project = Projects.findOne(projectId);

        var member = Members.findOne({userId: Meteor.userId(), projectId, role:Ols.Role.ROLE_ADMIN});
        if(member == null) {
            throw new Meteor.Error("Projects.methods.removeProject.not-authorised", "Only project admins can remove this project");
        }
        Releases.remove({projectId});
        Milestones.remove({projectId});
        if(Meteor.isServer) {
            ServerMessages.remove({projectId});
        }
        Items.remove({projectId});
        Refs.remove({projectId});
        Activity.remove({projectId});

        Projects.remove(projectId);

        if(Meteor.isServer) {
            Ols.Activity.addActivity({
                projectId,
                itemId: projectId,
                type: Ols.ActivityType.ACTIVITY_TYPE_PROJECT,
                longDescription: " deleted this " + (project.type == Ols.Project.PROJECT_TYPE_STANDARD?"project":"conversation")
            });
        }
    }
});


Projects.methods.markAsSeen = new ValidatedMethod({
    name: 'Projects.methods.markAsSeen',

    validate: new SimpleSchema({
        projectId: {type: String},
        userId: {type: String}
    }).validator(),

    run({projectId, userId}) {
        var project = Projects.findOne(projectId);
        if(project.seenList.indexOf(userId) == -1) {
            console.log('Projects.methods.markAsSeen(projectId=' + projectId + ', userId=' + userId);
            var result = Projects.update(projectId, {
                $addToSet: {seenList: userId},
                $set: {updatedAt: new Date()}
            });
            console.log('Projects.methods.markAsSeen result=' + result);
        }
    }
});

Projects.methods.setProjectCurrentRelease = new ValidatedMethod({
    name: 'Projects.methods.setProjectCurrentRelease',
    validate: new SimpleSchema({
        projectId: {type: String},
        releaseId: {type: String}
    }).validator(),

    run({projectId, releaseId}) {
        if (!this.userId) {
            throw new Meteor.Error("Projects.methods.setProjectCurrentRelease.not-authenticated");
        }
        var project = Projects.findOne(projectId);
        var member = Members.findOne({userId: Meteor.userId(), projectId, role:Ols.Role.ROLE_ADMIN});
        if(member == null) {
            throw new Meteor.Error("Projects.methods.setProjectCurrentRelease.not-authorised", "Only project admins can set the current release for this project");
        }

        var release = Releases.findOne(releaseId);
        if(release == null) {
            throw new Meteor.Error("Projects.methods.setProjectCurrentRelease.release-not-exist", "Release " + releaseId + " does not exist");
        }
        Projects.update(projectId, {$set: {currentReleaseId:releaseId, updatedAt: new Date()}});

        if(Meteor.isServer) {
            Ols.Activity.addActivity({
                projectId,
                itemId: projectId,
                type: Ols.ActivityType.ACTIVITY_TYPE_PROJECT,
                longDescription: " set current release to **" + release.title + "**"
            });
        }
    }
});

Projects.methods.removeProjectCurrentRelease = new ValidatedMethod({
    name: 'Projects.methods.removeProjectCurrentRelease',
    validate: new SimpleSchema({
        projectId: {type: String},
        releaseId: {type: String}
    }).validator(),

    run({projectId, releaseId}) {
        if (!this.userId) {
            throw new Meteor.Error("Projects.methods.removeProjectCurrentRelease.not-authenticated");
        }
        var project = Projects.findOne(projectId);
        var member = Members.findOne({userId: Meteor.userId(), projectId, role:Ols.Role.ROLE_ADMIN});
        if(member == null) {
            throw new Meteor.Error("Projects.methods.removeProjectCurrentRelease.not-authorised", "Only project admins can remove the current release for this project");
        }

        var release = Releases.findOne(releaseId);
        if(release == null) {
            throw new Meteor.Error("Projects.methods.removeProjectCurrentRelease.release-not-exist", "Release " + releaseId + " does not exist");
        }
        Projects.update(projectId, {$unset: {currentReleaseId:''}, $set: {updatedAt: new Date()}});

        if(Meteor.isServer) {
            Ols.Activity.addActivity({
                projectId,
                itemId: projectId,
                type: Ols.ActivityType.ACTIVITY_TYPE_PROJECT,
                longDescription: " set the current release to **Empty**"
            });
        }
    }
});


Projects.methods.setProjectNextRelease = new ValidatedMethod({
    name: 'Projects.methods.setProjectNextRelease',
    validate: new SimpleSchema({
        projectId: {type: String},
        releaseId: {type: String}
    }).validator(),

    run({projectId, releaseId}) {
        if (!this.userId) {
            throw new Meteor.Error("Projects.methods.removeProject.not-authenticated");
        }
        var project = Projects.findOne(projectId);
        var member = Members.findOne({userId: Meteor.userId(), projectId, role:Ols.Role.ROLE_ADMIN});
        if(member == null) {
            throw new Meteor.Error("Projects.methods.setProjectNextRelease.not-authorised", "Only project admins can set the next release for this project");
        }
        var release = Releases.findOne(releaseId);
        if(release == null) {
            throw new Meteor.Error("Projects.methods.setProjectNextRelease.release-not-exist", "Release " + releaseId + " does not exist");
        }
        Projects.update(projectId, {$set: {nextReleaseId:releaseId, updatedAt: new Date()}});

        if(Meteor.isServer) {
            Ols.Activity.addActivity({
                projectId,
                itemId: projectId,
                type: Ols.ActivityType.ACTIVITY_TYPE_PROJECT,
                longDescription: " set next release to **" + release.title + "**"
            });
        }
    }
});

Projects.methods.removeProjectNextRelease = new ValidatedMethod({
    name: 'Projects.methods.removeProjectNextRelease',
    validate: new SimpleSchema({
        projectId: {type: String},
        releaseId: {type: String}
    }).validator(),

    run({projectId, releaseId}) {
        if (!this.userId) {
            throw new Meteor.Error("Projects.methods.removeProjectNextRelease.not-authenticated");
        }
        var project = Projects.findOne(projectId);
        var member = Members.findOne({userId: Meteor.userId(), projectId, role:Ols.Role.ROLE_ADMIN});
        if(member == null) {
            throw new Meteor.Error("Projects.methods.removeProjectNextRelease.not-authorised", "Only project admins can remove the next release for this project");
        }
        var release = Releases.findOne(releaseId);
        if(release == null) {
            throw new Meteor.Error("Projects.methods.removeProjectNextRelease.release-not-exist", "Release " + releaseId + " does not exist");
        }
        Projects.update(projectId, {$unset: {nextReleaseId:''}, $set: {updatedAt: new Date()}});

        if(Meteor.isServer) {
            Ols.Activity.addActivity({
                projectId,
                itemId: projectId,
                type: Ols.ActivityType.ACTIVITY_TYPE_PROJECT,
                longDescription: " set the next release to **Empty**"
            });
        }
    }
});


Projects.methods.setTheme = new ValidatedMethod({
    name: 'Projects.methods.setTheme',

    validate: new SimpleSchema({
        projectId: {type: String},
        theme: {type: String}
    }).validator(),

    run({projectId, theme}) {
        if (!this.userId) {
            throw new Meteor.Error("Projects.methods.setTheme.not-authenticated");
        }
        var project = Projects.findOne(projectId);

        var member = Members.findOne({userId: Meteor.userId(), projectId, role:Ols.Role.ROLE_ADMIN});
        if(member == null) {
            throw new Meteor.Error("Projects.methods.setTheme.not-authorised", "Only project admins can change the theme for this project");
        }

        Projects.update(projectId, {
            $set: {theme: theme, updatedAt: new Date()}
        });

        if(Meteor.isServer) {
            Ols.Activity.addActivity({
                projectId,
                itemId: projectId,
                type: Ols.ActivityType.ACTIVITY_TYPE_PROJECT,
                longDescription: " changed the project theme to **" + theme + "**"
            });
        }
    }
});
