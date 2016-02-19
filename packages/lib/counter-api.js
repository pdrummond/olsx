Ols.Counter = {
    getProjectCounter: function(projectId) {
        return Meteor.isServer ? incrementCounter('counters', "project-counter-" + projectId) : -1;
    },

    getMessageCounter: function(projectId) {
        return Meteor.isServer ? incrementCounter('counters', "message-counter-" + projectId) : -1;
    }

};