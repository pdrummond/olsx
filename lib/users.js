Meteor.methods({
    updateUserSetCurrentProject: function(userId, projectId) {
        Meteor.users.update(userId, {$set: {currentProjectId: projectId}});
    },

    updateUserUnSetCurrentProject: function(userId) {
        Meteor.users.update(userId, {$unset: {currentProjectId: ''}});
    }
});