Meteor.methods({
    addTask: function(title, messageId) {

        var project = Projects.findOne(Meteor.user().defaultProjectId);

        if(project == null) {
            throw Meteor.Error('Unable to find user default project for user ' + Meteor.user().username)
        }

        var seq = incrementCounter('counters', project._id);
        var key = '';
        if(project.key) {
            key = project.key + '-' + seq;
        } else {
            key = seq;
        }

        Tasks.insert({
            title: title,
            status: 'new',
            createdBy: Meteor.userId(),
            createdByName: Meteor.user().username,
            updatedBy: Meteor.userId(),
            updatedByName: Meteor.user().username,
            messageId: messageId,
            projectId: project._id,
            seq: seq,
            key: key
        });
    }
});
