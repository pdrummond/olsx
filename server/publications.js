Meteor.publish("projects", function () {
    this.autorun(function(computation) {
        var projectIds = Members.find({userId: this.userId}).map(function (member) {
            return member.projectId;
        });
        return Projects.find({_id: {$in: projectIds}});
    });
});

Meteor.publish("tasks", function(projectId) {
   return Items.find({projectId, type: Ols.Item.ITEM_TYPE_ACTION, subType: Ols.Item.ACTION_SUBTYPE_TASK});
});

Meteor.publish("refs", function(projectId) {
    return Refs.find({projectId});
});

Meteor.publish('currentProject', function(projectId) {
    this.autorun(function(computation) {
        var c = Projects.find(projectId);
        return c;
    });
});

Meteor.publish("currentProjectMembers", function (projectId) {
    return Members.find({projectId: projectId});
});


Meteor.publish("allUsernames", function () {
    return Meteor.users.find({}, {fields: {
        "username": 1,
        "profileImage": 1,
        "currentProjectId": 1
    }});
});

Meteor.publish("userStatus", function() {
    return Meteor.users.find({ "status.online": true }, { fields: { "username": 1, "status":1 } });
});

