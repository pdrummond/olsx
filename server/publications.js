Meteor.publish("projects", function () {
    this.autorun(function(computation) {
        var projectIds = Members.find({userId: this.userId}).map(function (member) {
            return member.projectId;
        });
        return Projects.find({_id: {$in: projectIds}});
    });
});

Meteor.publish("items", function(projectId) {
   return Items.find({projectId});
});

Meteor.publish("refs", function(projectId) {
    return Refs.find({projectId});
});

Meteor.publish("releases", function() {
    return Releases.find();
});

Meteor.publish('currentRelease', function(releaseId) {
    this.autorun(function(computation) {
        return Releases.find(releaseId);
    });
});

Meteor.publish("milestones", function(projectId) {
    return Milestones.find({projectId});
});


Meteor.publish('currentProject', function(projectId) {
    this.autorun(function(computation) {
        return Projects.find(projectId);
    });
});

Meteor.publish('currentMilestone', function(milestoneId) {
    this.autorun(function(computation) {
        return Milestones.find(milestoneId);
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

//http://docs.meteor.com/#/full/meteor_publish
Meteor.publish("milestoneTaskCounts", function (milestoneId) {
    var self = this;
    var totalCount = 0;
    var openCount = 0;
    var doneCount = 0;
    var initializing = true;
    var handle = Items.find({milestoneId: milestoneId}).observeChanges({
        added: function (id, fields) {
            totalCount++;
            if(Ols.Status.isOpen(fields.status)) {
                openCount++;
            } else {
                doneCount++;
            }
            if (!initializing) {
                self.changed("milestone-task-counts", milestoneId, {totalCount, openCount, doneCount});
            }
        },
        removed: function (id) {
            totalCount--;
            if(Ols.Status.isOpen(fields.status)) {
                openCount--;
            } else {
                doneCount--;
            }
            self.changed("milestone-task-counts", milestoneId, {totalCount, openCount, doneCount});
        }
        // don't care about moved or changed
    });

    // Observe only returns after the initial added callbacks have
    // run.  Now return an initial value and mark the subscription
    // as ready.
    initializing = false;
    self.added("milestone-task-counts", milestoneId, {totalCount, openCount, doneCount});
    self.ready();

    // Stop observing the cursor when client unsubs.
    // Stopping a subscription automatically takes
    // care of sending the client any removed messages.
    self.onStop(function () {
        handle.stop();
    });
});

//http://docs.meteor.com/#/full/meteor_publish
Meteor.publish("projectActionCounts", function (projectId) {
    var self = this;
    var totalCount = 0;
    var openCount = 0;
    var doneCount = 0;
    var initializing = true;
    var handle = Items.find({projectId: projectId, type:Ols.Item.ITEM_TYPE_ACTION}).observeChanges({
        added: function (id, fields) {
            totalCount++;
            if(Ols.Status.isOpen(fields.status)) {
                openCount++;
            } else {
                doneCount++;
            }
            if (!initializing) {
                self.changed("project-action-counts", projectId, {totalCount, openCount, doneCount});
            }
        },
        removed: function (id) {
            totalCount--;
            if(Ols.Status.isOpen(fields.status)) {
                openCount--;
            } else {
                doneCount--;
            }
            self.changed("project-action-counts", projectId, {totalCount, openCount, doneCount});
        }
        // don't care about moved or changed
    });

    // Observe only returns after the initial added callbacks have
    // run.  Now return an initial value and mark the subscription
    // as ready.
    initializing = false;
    self.added("project-action-counts", projectId, {totalCount, openCount, doneCount});
    self.ready();

    // Stop observing the cursor when client unsubs.
    // Stopping a subscription automatically takes
    // care of sending the client any removed messages.
    self.onStop(function () {
        handle.stop();
    });
});