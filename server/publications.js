Meteor.publish("projects", function () {
    this.autorun(function(computation) {
        var projectIds = Members.find({userId: this.userId}).map(function (member) {
            return member.projectId;
        });
        return Projects.find({_id: {$in: projectIds}});
    });
});

Meteor.publish("items", function(projectId) {
    if(Members.findOne({userId: this.userId, projectId})) {
        return Items.find({projectId});
    } else {
        return null;
    }
});

Meteor.publish('currentItem', function(itemId) {
    var self = this;
    this.autorun(function(computation) {
        var item = Items.findOne(itemId);
        if(Members.findOne({userId: self.userId, projectId: item.projectId})) {
            return Items.find(itemId);
        } else {
            return null;
        }
    });
});

Meteor.publish('itemActivity', function(itemId) {
    var self = this;
    this.autorun(function(computation) {
        var item = Items.findOne(itemId);
        if(Members.findOne({userId: self.userId, projectId: item.projectId})) {
            return Activity.find({itemId: itemId});
        } else {
            return null;
        }
    });
});

Meteor.publish("refs", function(projectId) {
    if(Members.findOne({userId: this.userId, projectId: projectId})) {
        return Refs.find({projectId});
    } else {
        return null;
    }
});

Meteor.publish("releases", function(projectId) {
    if(Members.findOne({userId: this.userId, projectId})) {
        return Releases.find({projectId});
    } else {
        return null;
    }
});

Meteor.publish('currentRelease', function(releaseId) {
    var self = this;
    this.autorun(function(computation) {
        var release = Releases.findOne(releaseId);
        if(Members.findOne({userId: self.userId, projectId: release.projectId})) {
            return Releases.find(releaseId);
        } else {
            return null;
        }
    });
});

Meteor.publish('projectCurrentRelease', function(projectId) {
    var project = Projects.findOne(projectId);
    if(project && Members.findOne({userId: this.userId, projectId})) {
        return Releases.find(project.currentReleaseId);
    } else {
        return null;
    }
});

Meteor.publish('projectNextRelease', function(projectId) {
    var project = Projects.findOne(projectId);
    if(project && Members.findOne({userId: this.userId, projectId: project._id})) {
        return Releases.find(project.nextReleaseId);
    } else {
        return null;
    }
});

Meteor.publish("milestones", function(projectId) {
    if(Members.findOne({userId: this.userId, projectId: projectId})) {
        return Milestones.find({projectId});
    } else {
        return null;
    }
});

Meteor.publish('currentProject', function(projectId) {
    var self = this;
    this.autorun(function(computation) {
        if(Members.findOne({userId: self.userId, projectId})) {
            return Projects.find(projectId);
        } else {
            return null;
        }
    });
});

Meteor.publish('currentMilestone', function(milestoneId) {
    var self = this;
    this.autorun(function(computation) {
        var milestone = Milestones.findOne(milestoneId);
        if(Members.findOne({userId: self.userId, projectId: milestone.projectId})) {
            return Milestones.find(milestoneId);
        } else {
            return null;
        }
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
Meteor.publish("projectTotals", function (projectId) {
    var self = this;
    var totals = {
        totalActionCount:0,
        openActionCount:0,
        closedActionCount:0,
        totalBugCount:0,
        openBugCount:0,
        closedBugCount:0,
        totalTaskCount:0,
        openTaskCount:0,
        closedTaskCount:0,
        openBacklogActionCount:0
    };
    var initializing = true;
    var handle = Items.find({projectId: projectId}).observeChanges({
        added: function (id, item) {
            if(item.subType == Ols.Item.ACTION_SUBTYPE_TASK || item.subType == Ols.Item.ISSUE_SUBTYPE_BUG) {
                totals.totalActionCount++;
                if (Ols.Status.isOpen(item.status)) {
                    totals.openActionCount++;
                    if(!item.milestoneId ) {
                        totals.openBacklogActionCount++;
                    }
                } else {
                    totals.closedActionCount++;
                }
            }
            if(item.subType == Ols.Item.ACTION_SUBTYPE_TASK) {
                totals.totalTaskCount++;
                if (Ols.Status.isOpen(item.status)) {
                    totals.openTaskCount++;
                } else {
                    totals.closedTaskCount++;
                }
            }
            if(item.subType == Ols.Item.ISSUE_SUBTYPE_BUG) {
                totals.totalBugCount++;
                if (Ols.Status.isOpen(item.status)) {
                    totals.openBugCount++;
                } else {
                    totals.closedBugCount++;
                }
            }

            if (!initializing) {
                self.changed("project-totals", projectId, totals);
            }
        },
        removed: function (id) {
            if(item.subType == Ols.Item.ACTION_SUBTYPE_TASK || item.subType == Ols.Item.ISSUE_SUBTYPE_BUG) {
                totals.totalActionCount--;
                if (Ols.Status.isOpen(item.status)) {
                    totals.openActionCount--;
                    if(!item.milestoneId ) {
                        totals.openBacklogActionCount--;
                    }
                } else {
                    totals.closedActionCount--;
                }
            }

            if(item.subType == Ols.Item.ACTION_SUBTYPE_TASK) {
                totals.totalTaskCount--;
                if (Ols.Status.isOpen(item.status)) {
                    totals.openTaskCount--;
                } else {
                    totals.closedTaskCount--;
                }
            }

            if(item.subType == Ols.Item.ISSUE_SUBTYPE_BUG) {
                totals.totalBugCount--;
                if (Ols.Status.isOpen(item.status)) {
                    totals.openBugCount--;
                } else {
                    totals.closedBugCount--;
                }
            }
            self.changed("project-totals", projectId, totals);
        }
        // don't care about moved or changed
    });

    // Observe only returns after the initial added callbacks have
    // run.  Now return an initial value and mark the subscription
    // as ready.
    initializing = false;
    self.added("project-totals", projectId, totals);
    self.ready();

    // Stop observing the cursor when client unsubs.
    // Stopping a subscription automatically takes
    // care of sending the client any removed messages.
    self.onStop(function () {
        handle.stop();
    });
});