Projects = new Mongo.Collection('projects');

Projects.schema = new SimpleSchema([BaseSchema, {
    title: {type: String},
    type: {type: String},
    messageId: {type: String, optional: true}
}]);

Projects.attachSchema(Projects.schema);

Projects.methods = {};
Projects.methods.addProject = new ValidatedMethod({
    name: 'Projects.methods.addProject',

    validate: new SimpleSchema({
        title: {type: String},
        type: {type: String},
        messageId: {type: String, optional: true}
    }).validator(),

    run({title, type, messageId}) {
        if (!this.userId) {
            throw new Meteor.Error("Projects.methods.addProject.not-authorized");
        }

        var now = new Date();
        var project = {
            createdAt: now,
            updatedAt: now,
            createdBy: Meteor.userId(),
            updatedBy: Meteor.userId(),
            createdByName: Meteor.user().username,
            updatedByName: Meteor.user().username,
            title:title,
            type:type
        };
        if(messageId != null) {
            project.messageId = messageId
        }

        var projectId = Projects.insert(project);
        project._id = projectId;
        return project;
    }
})
