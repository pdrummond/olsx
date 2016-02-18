
Projects.schema = new SimpleSchema([BaseSchema, {
    title: {type: String},
    seenList: {type: [String]}
}]);

Projects.attachSchema(Projects.schema);

Projects.methods = {};
Projects.methods.addProject = new ValidatedMethod({
    name: 'Projects.methods.addProject',
    validate: new SimpleSchema({
        title: {type: String}
    }).validator(),
    run({title}) {
        if (!this.userId) {
            throw new Meteor.Error("Projects.methods.addProject.not-authorized");
        }

        var userId = Meteor.userId();
        var username = Meteor.user().username;

        var now = new Date();
        var project = {
            title: title,
            createdAt: now,
            updatedAt: now,
            createdBy: userId,
            updatedBy: userId,
            createdByName: username,
            updatedByName: username,
            seenList: [],
        };

        var projectId = Projects.insert(project);
        console.log('>> added project ' + projectId);
        project._id = projectId;

        var member = {
            userId: userId,
            username: username,
            projectId: projectId,
            role: Ols.ROLE_ADMIN,
            createdAt: now,
            updatedAt: now,
            createdBy: userId,
            updatedBy: userId,
            createdByName: username,
            updatedByName: username
        };

        Members.insert(member);

        return project;
    },
});

Projects.methods.removeProject = new ValidatedMethod({
    name: 'Projects.methods.removeProject',
    validate: new SimpleSchema({
        projectId: {type: String}
    }).validator(),

    run({projectId}) {
        if (!this.userId) {
            throw new Meteor.Error("Projects.methods.removeProject.not-authorized");
        }
        Tasks.remove({projectId:projectId});
        if(Meteor.isServer) {
            ServerMessages.remove({projectId: projectId});
        }
        Projects.remove(projectId);
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

