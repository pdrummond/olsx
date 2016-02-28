//Yeah, okay so I'm using 'z' to ensure this gets loaded last. Give me a break!
//I'm going to be re-factoring everything for meteor 1.3 anyway, so for now
//this is a quick win.

Activity.schema = new SimpleSchema([BaseSchema, {
    type: {type: String},
    projectId: {type:String},
    projectKey: {type:String},
    messageId: {type: String},
    messageSeq: {type: Number},
    content: {type: String},
    itemId: {type:String, optional:true}
}]);

Activity.attachSchema(Activity.schema);

Meteor.methods({
    addActivityMessage: function(content, type, projectId, messageId, messageSeq, itemId) {
        if (!this.userId) {
            throw new Meteor.Error("Activity.methods.addActivityMessage.not-authenticated");
        }

        var project = Projects.findOne(projectId);
        if (project == null) {
            throw new Meteor.Error("Activity.methods.addActivityMessage.project-not-exist", "Project " + projectId + " does not exist");
        }

        var userId = Meteor.userId();
        var username = Meteor.user().username;

        var now = new Date();
        var activityMessage = {
            projectId,
            projectKey: project.key,
            messageId: messageId,
            messageSeq: messageSeq,
            content,
            type: type,
            createdAt: now,
            updatedAt: now,
            createdBy: userId,
            updatedBy: userId,
            createdByName: username,
            updatedByName: username,
            itemId
        };

        activityMessage._id = Activity.insert(activityMessage);
        return activityMessage;
    }
});