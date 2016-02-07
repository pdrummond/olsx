Meteor.methods({
    addTask: function(title, conversationId, messageId) {

        var conversation = Conversations.findOne(conversationId);

        if(conversation == null) {
            throw Meteor.Error('Error adding task', 'invalid conversation ID: ' + conversationId);
        }

        var project = Projects.findOne(conversation.defaultProjectId);

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

        var task = {
            title: title,
            status: 'new',
            createdBy: Meteor.userId(),
            createdByName: Meteor.user().username,
            updatedBy: Meteor.userId(),
            updatedByName: Meteor.user().username,
            messageId: messageId,
            projectId: project._id,
            conversationId: conversationId,
            seq: seq,
            key: key
        };

        var taskId = Tasks.insert(task);
        task._id = taskId;
        return task;
    }
});
