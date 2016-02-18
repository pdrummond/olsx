
Ols.Command.defineCommand('/task', function(ctx) {
    var ok = false;
    var args = ctx.args;

    if(args.length > 1) {
        var subCommand = args[1];
        if (subCommand.startsWith('#')) {
            if(args.length > 2) {
                var subSubCommand = args[2];
                switch (subSubCommand) {
                    case 'delete'     : { ok = deleteTaskSubCommand(ctx);   break; }
                    case 'archive'    : { ok = archiveTaskSubCommand(ctx);  break; }
                    case 'restore'    : { ok = restoreTaskSubCommand(ctx);  break; }

                    case 'assign-to' : {
                        ok = taskAssignSubCommand(ctx);   break;
                    }
                    case 'accept'    : { ok = taskAcceptSubCommand(ctx);    break; }
                    case 'start'     : { ok = taskStartSubCommand(ctx);    break; }
                    case 'stop'      : { ok = taskStopSubCommand(ctx);     break; }
                    case 'done'      : { ok = taskDoneSubCommand(ctx);     break; }
                    case 'refs'      : { ok = taskRefsSubCommand(ctx);     break; }
                    default: {
                        console.error("Invalid sub-sub-command: " + subSubCommand);
                        Ols.Message.systemErrorMessage(ctx.projectId, 'Error: "' + subSubCommand + '" not recognised.  Type /task help for more info.');
                        ok = false;
                        break;
                    }
                }
            } else {
                Ols.Message.systemErrorMessage(ctx.projectId, "This command will eventually show task details.  But it's not implemented yet! Come back in a few weeks and try again ;-)");
                ok = false;
            }
        } else {
            switch (subCommand) {
                case 'add':
                    ok = addTaskSubCommand(ctx);
                    break;
                case 'list': {
                    ok = taskListSubCommand(ctx);
                    break;
                }
                case 'list-archived': {
                        ok = taskListArchivedSubCommand(ctx);
                        break;
                }
                /* TODO: This will need to be implemented as a client-side command.
                 case 'jump': { //example: /msg jump 5664
                 if(args.length > 2) {
                 var msgSeq = parseInt(args[2]);
                 if(msgSeq) {
                 FlowRouter.go('projectPageStartSeq', {startMessageSeq: msgSeq});
                 } else {
                 Ols.Message.systemErrorMessage(ctx.projectId, 'Error running msg jump command. Type /msg help for more info.');
                 }
                 } else {
                 Ols.Message.systemErrorMessage(ctx.projectId, 'Invalid arguments for msg jump command. Type /msg help for more info.');
                 }
                 break;
                 }*/
                default:
                    Ols.Message.systemErrorMessage(ctx.projectId, 'Invalid arguments for task command.  Type /task help for more info.');
                    ok = false;
                    break;

            }
        }
    } else {
        Ols.Message.systemErrorMessage(ctx.projectId, 'Invalid arguments for command.  Type /task help for more info.');
    }
    return ok;
});

function addTaskSubCommand(ctx) {
        /*
         Example Command: /task add <description optional>
         */
        var ok = false;
        var args = ctx.args;
        if (args.length > 2) {
            var description = args.slice().splice(2).join(" ");
            ok = doAddTask(ctx, description);
        } else {
            Ols.LoopBot.promptMessage({
                processName: '/task.add',
                projectId: ctx.projectId,
                content: "To create this task I need a description.  When ready, type `@loopbot` then your description.",
                responseHandler: function (message, description) {
                    Ols.LoopBot.infoMessage({
                        projectId: ctx.projectId,
                        content: ("Thanks " + message.createdByName + ".  Using `" + Ols.StringUtils.truncate(description, 50) + "` as the description for your new task and creating it now.")
                    }, function (err, msg) {
                        ok = doAddTask(ctx, description);
                    });
                }
            });
        }

    return ok;
}

function doAddTask(ctx, description) {
    var ok = false;
    Items.methods.addTask.call({
        description: description,
        projectId: ctx.projectId,
        messageId: ctx.message._id,
        messageSeq: ctx.message.seq
    }, (err, task) => {
        if (err) {
            if (err.reason) {
                Ols.Message.systemErrorMessage(ctx.projectId, "Error adding task: " + err.reason);
            } else {
                Ols.Message.systemErrorMessage(ctx.projectId, "Error adding task: Unexpected error occurred");
                throw Error('Internal error adding task: ' + err.message);
            }
            ok = false;
        } else {
            Ols.Message.systemSuccessMessage(ctx.projectId, Meteor.user().username + " added task " + task.key + ": " + description);
            ok = true;
        }
    });
    return ok;
}

function deleteTaskSubCommand(ctx) {
    var ok = false;
    var args = ctx.args;
    if (args.length > 1) {
        var key = parseInt(args[1].replace('#', ''));
        Items.methods.removeItem.call({projectId: ctx.projectId, key: key}, (err) => {
            if (err) {
                Ols.Message.systemErrorMessage(ctx.projectId, "Error deleting task: " + err.reason);
                ok = false;
            } else {
                Ols.Message.systemSuccessMessage(ctx.projectId, Meteor.user().username + " removed task #" + key);
                ok = true;
            }
        });
    }
    return ok;
}

function getTaskKey(ctx) {
    var taskKey;
    if (ctx.args.length > 2) {
        taskKey = parseInt(ctx.args[1].replace('#', ''));
    }
    return taskKey;
}

function taskStartSubCommand(ctx) {
    taskSetStatusSubCommand(ctx, Ols.Status.IN_PROGRESS, function(err, task) {
        if (err) {
            Ols.Message.systemErrorMessage(ctx.projectId, "Error starting task: " + err.reason);
        } else {
            Ols.Message.systemSuccessMessage(ctx.projectId, Meteor.user().username + " started working on task #" + task.key + ".");
        }
    });
}

function taskAcceptSubCommand(ctx) {
    taskSetStatusSubCommand(ctx, Ols.Status.OPEN, function(err, task) {
        if (err) {
            Ols.Message.systemErrorMessage(ctx.projectId, "Error accepting task: " + err.reason);
        } else {
            Ols.Message.systemSuccessMessage(ctx.projectId, Meteor.user().username + " accepted task #" + task.key + ".");
        }
    });
}

function taskStopSubCommand(ctx) {
    taskSetStatusSubCommand(ctx, Ols.Status.PAUSED, function(err, task) {
        if (err) {
            Ols.Message.systemErrorMessage(ctx.projectId, "Error stopping task: " + err.reason);
        } else {
            Ols.Message.systemSuccessMessage(ctx.projectId, Meteor.user().username + " stopped working on task #" + task.key + ".");
        }
    });
}

function taskDoneSubCommand(ctx) {
    taskSetStatusSubCommand(ctx, Ols.Status.DONE, function(err, task) {
        if (err) {
            Ols.Message.systemErrorMessage(ctx.projectId, "Error completing task: " + err.reason);
        } else {
            Ols.Message.systemSuccessMessage(ctx.projectId, Meteor.user().username + " completed task #" + task.key + ".");
        }
    });
}

function taskSetStatusSubCommand(ctx, status, callback) {
    var ok = false;
    var key = getTaskKey(ctx);
    if(key != null) {
        Items.methods.updateTaskStatus.call({
            projectId: ctx.projectId,
            key,
            status
        }, (err, task) => {
            callback(err, task);
        });
    } else {
        Ols.Message.systemErrorMessage(ctx.projectId, 'Invalid arguments for task command.  Type /task help for more info.');
    }
    return ok;
}

function taskAssignSubCommand(ctx) {
    /*
        Command Example: /task #12 assign-to pdrummond
    */
    var ok = false;
    var args = ctx.args;

    if (args.length > 2) {
        var key = parseInt(args[1].replace('#', ''));
        var assignee = args[3].trim();

        Items.methods.updateTaskAssignee.call({
            projectId: ctx.projectId,
            key,
            assignee
        }, (err) => {
            if (err) {
                Ols.Message.systemErrorMessage(ctx.projectId, "Error changing assignee: " + err.reason);
                ok = false;
            } else {
                Ols.Message.systemSuccessMessage(ctx.projectId, Meteor.user().username + " assigned task #" + key + " to '" + assignee + "'");
                ok = true;
            }
        });
    } else {
        Ols.Message.systemErrorMessage(ctx.projectId, 'Invalid arguments for task set command. Type /task help for more info.');
        ok = false;
    }
    return ok;
}

function archiveTaskSubCommand(ctx) {
    var ok = false;
    var args = ctx.args;

    if (args.length > 2) {
        var key = getTaskKey(ctx);
        Items.methods.archiveTask.call({
            projectId: ctx.projectId,
            key
        }, (err) => {
            if (err) {
                Ols.Message.systemErrorMessage(ctx.projectId, "Error archiving task: " + err.reason);
                ok = false;
            } else {
                Ols.Message.systemSuccessMessage(ctx.projectId, Meteor.user().username + " archived task #" + key + ".");
                ok = true;
            }
        });
    } else {
        Ols.Message.systemErrorMessage(ctx.projectId, 'Invalid arguments for task archive command. Type /task help for more info.');
        ok = false;
    }
    return ok;
}

function restoreTaskSubCommand(ctx) {
    var ok = false;
    var args = ctx.args;

    if (args.length > 2) {
        var key = getTaskKey(ctx);
        Items.methods.restoreTask.call({
            projectId: ctx.projectId,
            key
        }, (err) => {
            if (err) {
                Ols.Message.systemErrorMessage(ctx.projectId, "Error restoring task: " + err.reason);
                ok = false;
            } else {
                Ols.Message.systemSuccessMessage(ctx.projectId, Meteor.user().username + " restored task #" + key + ".");
                ok = true;
            }
        });
    } else {
        Ols.Message.systemErrorMessage(ctx.projectId, 'Invalid arguments for task restore command. Type /task help for more info.');
        ok = false;
    }
    return ok;
}


function taskListSubCommand(ctx) {
    var ok = false;
    var args = ctx.args;

    var filter = {};
    if (args.length > 2) {
        filter = Ols.Filter.parseString(args[2]);
    }
    filter.projectId = ctx.projectId;
    filter.isArchived = false;

    var customMessageType = '/task.list';
    console.log('-- saving custom message (' + customMessageType + ') for project ' + ctx.projectId);
    Meteor.call('saveMessage', {
        projectId: ctx.projectId,
        messageType: Ols.MESSAGE_TYPE_CUSTOM,
        customMessageType: customMessageType,
        tasks: Items.find(filter).fetch(),
        createdBy: Meteor.userId(),
        updatedBy: Meteor.userId(),
        createdByName: Meteor.user().username,
        updatedByName: Meteor.user().username
    }, function (err, msg) {
        if (err != null) {
            console.error("-- error saving task list custom message " + JSON.stringify(err));
            Ols.Message.systemErrorMessage(ctx.projectId, 'Error running task list command. Could not generate task list. Type /task help for more info.');
            ok = false;
        } else {
            console.error("-- task list custom message " + msg.seq + " generated successfully.");
            ok = true;
        }
    });
    return ok;
}

function taskListArchivedSubCommand(ctx) {
    var ok = false;
    var args = ctx.args;

    var filter = {};
    if (args.length > 2) {
        filter = Ols.Filter.parseString(args[2]);
    }
    filter.projectId = ctx.projectId;
    filter.isArchived = true;

    var customMessageType = '/task.list';
    console.log('-- saving custom message (' + customMessageType + ') for project ' + ctx.projectId);
    Meteor.call('saveMessage', {
        projectId: ctx.projectId,
        messageType: Ols.MESSAGE_TYPE_CUSTOM,
        customMessageType: customMessageType,
        tasks: Items.find(filter).fetch(),
        createdBy: Meteor.userId(),
        updatedBy: Meteor.userId(),
        createdByName: Meteor.user().username,
        updatedByName: Meteor.user().username
    }, function (err, msg) {
        if (err != null) {
            console.error("-- error saving archived list custom message " + JSON.stringify(err));
            Ols.Message.systemErrorMessage(ctx.projectId, 'Error running task list command. Could not generate task list. Type /task help for more info.');
            ok = false;
        } else {
            console.error("-- archived list custom message " + msg.seq + " generated successfully.");
            ok = true;
        }
    });
    return ok;
}

function taskRefsSubCommand(ctx) {
    /*
     Command example: /task #2 refs
     */
    var args = ctx.args;
    var ok = false;
    var filter = {};
    if (args.length > 2) {
        var taskKey = parseInt(args[1].replace('#', ''));
        if (taskKey) {
            var refList = Refs.find({taskKey: taskKey}).fetch();

            var customMessageType = '/task.refs';
            console.log('-- saving custom message (' + customMessageType + ') for project ' + ctx.projectId);
            Meteor.call('saveMessage', {
                projectId: ctx.projectId,
                messageType: Ols.MESSAGE_TYPE_CUSTOM,
                customMessageType: customMessageType,
                taskKey: taskKey,
                refs: refList,
                createdBy: Meteor.userId(),
                updatedBy: Meteor.userId(),
                createdByName: Meteor.user().username,
                updatedByName: Meteor.user().username
            }, function (err, msg) {
                if(err) {
                    console.error("-- error saving ref list custom message " + msg.seq);
                    Ols.Message.systemErrorMessage(ctx.projectId, 'Error running task refs command. Could not generate ref list. Type /task help for more info.');
                    ok = false;
                } else {
                    console.error("-- ref list custom message " + msg.seq + " generated successfully.");
                    ok = true;
                }
            });
        } else {
            Ols.Message.systemErrorMessage(ctx.projectId, 'Error running task refs command. Could not parse key properly. Type /task help for more info.');
            ok = false;
        }
    } else {
        Ols.Message.systemErrorMessage(ctx.projectId, 'Invalid arguments for task refs command. Type /task help for more info.');
        ok = false;
    }
    return ok;
}


Ols.Command.defineComponent('/task.list', function(ctx) {
    return <TaskListMessage key={ctx._id} ctx={ctx}/>;
});

Ols.Command.defineComponent('/task.refs', function(ctx) {
    return <RefListMessage key={ctx._id} ctx={ctx}/>;
});
