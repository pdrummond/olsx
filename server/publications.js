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
        /*var projectIds = Members.find({userId: this.userId}).map(function (member) {
            return member.projectId;
        });
        return Items.find({projectId: {$in: projectIds}});*/
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
    var handle = Items.find({milestoneId: milestoneId}).observe({
        added: function (item) {
            if(item.subType == Ols.Item.ACTION_SUBTYPE_TASK || item.subType == Ols.Item.ISSUE_SUBTYPE_BUG) {
                if(Ols.Status.isOpen(item.status) || item.status == Ols.Status.DONE) {
                    if(item.status == Ols.Status.DONE) {
                        doneCount++;
                    } else {
                        openCount++;
                    }
                    totalCount++;
                }
            }
            if (!initializing) {
                self.changed("milestone-task-counts", milestoneId, {totalCount, openCount, doneCount});
            }
        },
        removed: function (item) {
            if(item.subType == Ols.Item.ACTION_SUBTYPE_TASK || item.subType == Ols.Item.ISSUE_SUBTYPE_BUG) {
                if(Ols.Status.isOpen(item.status) || item.status == Ols.Status.DONE) {
                    if(item.status == Ols.Status.DONE) {
                        doneCount--;
                    } else {
                        openCount--;
                    }
                    totalCount--;
                }
            }
            self.changed("milestone-task-counts", milestoneId, {totalCount, openCount, doneCount});
        },

        changed: function(changedItem, existingItem) {
            /*
                Leaving this for now - there must be a better way than trying to figure out
                every single scenario.  Maybe just get it to refresh the milestone view?
            */
            //console.log("milestone-counts: CHANGES DETECTED");
            //console.log("-- existing item " + existingItem._id + " is " + existingItem.subType);
            //console.log("-- changed item " + changedItem.id + " is " + changedItem.subType);
            //Only one field can change at a time so we need to check for either the subType change
            //or the status change.  If it's subType, we still need to take the status into account!

            //If the subType has changed
            /*if(existingItem.subType != changedItem.subType) {
                if(!Ols.Item.isDoable(existingItem.subType) && Ols.Item.isDoable(changedItem.subType)) {
                    if(!Ols.Status.isInvalidType(existingItem.status)) {
                        if(changedItem.status == Ols.Status.DONE) {
                            doneCount++;
                        } else {
                            openCount++;
                        }
                        totalCount++;
                    }
                } else {
                    if(!Ols.Status.isInvalidType(existingItem.status)) {
                        if(changedItem.status == Ols.Status.DONE) {
                            doneCount--;
                        } else {
                            openCount--;
                        }
                        totalCount--;
                    }

                }
            } else if(existingItem.status != changedItem.status) {
                //If item wasn't open before and it is open now
                if(!Ols.Status.isOpen(existingItem.status) && Ols.Status.isOpen(changedItem.status)) {
                    openCount++;
                    //If item was done before, and it's open now, then need to decrease done count
                    if(existingItem.status == Ols.Status.DONE) {
                        doneCount--;
                    }
                    //If item was rejected before, then now it's open, need to increase the total count
                    if(existingItem.status != Ols.Status.DONE) {
                        totalCount++;
                    }
                //If item was open before and it isn't open now
                } else {
                    openCount--;
                    //If item is done and rejected then, decrease the total count
                    if(changedItem.status != Ols.Status.DONE) {
                        totalCount--;
                    }
                    //If item is done and not rejected, then increase the done count.
                    if(changedItem.status == Ols.Status.DONE) {
                        doneCount++;
                    }
                }
            }
            self.changed("milestone-task-counts", milestoneId, {totalCount, openCount, doneCount});*/
        }

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
        inTestActionCount:0,
        openActionCount:0,
        closedActionCount:0,
        inTestBugCount:0,
        totalBugCount:0,
        openBugCount:0,
        closedBugCount:0,
        totalTaskCount:0,
        inTestTaskCount:0,
        openTaskCount:0,
        closedTaskCount:0,
        openBacklogActionCount:0
    };
    var initializing = true;
    /*
        An 'action' in this context refers to either a bug or an action (it's
        bascically something that needs to be done and therefore it affects the
        completion status).

        The logic goes like this: only actions and bugs are counted.  Of those
        items, only those that are either open or done are counted - rejected,
        dups, and out-of-scope items are ignored.  All open items are counted
        as open - of those items, the ones that are in-test have a special
        count, but in-test items are still open.

    */
    var handle = Items.find({projectId: projectId}).observe({
        added: function (item) {
            if(item.subType == Ols.Item.ACTION_SUBTYPE_TASK || item.subType == Ols.Item.ISSUE_SUBTYPE_BUG) {
                if(Ols.Status.isOpen(item.status) || item.status == Ols.Status.DONE) {
                    if(item.status == Ols.Status.DONE) {
                        totals.closedActionCount++;
                    } else {
                        totals.openActionCount++;
                    }
                    totals.totalActionCount++;
                }

                if(item.status == Ols.Status.IN_TEST) {
                    totals.inTestActionCount++;
                }

                if (Ols.Status.isOpen(item.status) && !item.milestoneId) {
                    totals.openBacklogActionCount++;
                }
            }

            if(item.subType == Ols.Item.ACTION_SUBTYPE_TASK) {
                if(Ols.Status.isOpen(item.status) || item.status == Ols.Status.DONE) {
                    if(item.status == Ols.Status.DONE) {
                        totals.closedTaskCount++;
                    } else {
                        totals.openTaskCount++;
                    }
                    totals.totalTaskCount++;
                }

                if(item.status == Ols.Status.IN_TEST) {
                    totals.inTestTaskCount++;
                }

                if (Ols.Status.isOpen(item.status) && !item.milestoneId) {
                    totals.openBacklogTaskCount++;
                }
            }

            if(item.subType == Ols.Item.ISSUE_SUBTYPE_BUG) {
                if(Ols.Status.isOpen(item.status) || item.status == Ols.Status.DONE) {
                    if(item.status == Ols.Status.DONE) {
                        totals.closedBugCount++;
                    } else {
                        totals.openBugCount++;
                    }
                    totals.totalBugCount++;
                }

                if(item.status == Ols.Status.IN_TEST) {
                    totals.inTestBugCount++;
                }

                if (Ols.Status.isOpen(item.status) && !item.milestoneId) {
                    totals.openBacklogBugCount++;
                }
            }

            if (!initializing) {
                self.changed("project-totals", projectId, totals);
            }
        },
        removed: function (item) {
            if(item.subType == Ols.Item.ACTION_SUBTYPE_TASK || item.subType == Ols.Item.ISSUE_SUBTYPE_BUG) {
                if(Ols.Status.isOpen(item.status) || item.status == Ols.Status.DONE) {
                    if(item.status == Ols.Status.DONE) {
                        totals.closedActionCount--;
                    } else {
                        totals.openActionCount--;
                    }
                    totals.totalActionCount--;
                }

                if(item.status == Ols.Status.IN_TEST) {
                    totals.inTestActionCount--;
                }

                if (Ols.Status.isOpen(item.status) && !item.milestoneId) {
                        totals.openBacklogActionCount--;
                }
            }

            if(item.subType == Ols.Item.ACTION_SUBTYPE_TASK) {
                if(Ols.Status.isOpen(item.status) || item.status == Ols.Status.DONE) {
                    if(item.status == Ols.Status.DONE) {
                        totals.closedTaskCount--;
                    } else {
                        totals.openTaskCount--;
                    }
                    totals.totalTaskCount--;
                }

                if(item.status == Ols.Status.IN_TEST) {
                    totals.inTestTaskCount--;
                }

                if (Ols.Status.isOpen(item.status) && !item.milestoneId) {
                    totals.openBacklogTaskCount--;
                }
            }

            if(item.subType == Ols.Item.ISSUE_SUBTYPE_BUG) {
                if(Ols.Status.isOpen(item.status) || item.status == Ols.Status.DONE) {
                    if(item.status == Ols.Status.DONE) {
                        totals.closedBugCount--;
                    } else {
                        totals.openBugCount--;
                    }
                    totals.totalBugCount--;
                }

                if(item.status == Ols.Status.IN_TEST) {
                    totals.inTestBugCount--;
                }

                if (Ols.Status.isOpen(item.status) && !item.milestoneId) {
                    totals.openBacklogBugCount--;
                }
            }


            if (!initializing) {
                self.changed("project-totals", projectId, totals);
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
