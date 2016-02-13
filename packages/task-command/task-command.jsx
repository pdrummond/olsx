
Ols.Command.defineCommand('/task', function(ctx) {
    var ok = false;
    var args = ctx.args;

    if(args.length > 1) {
        var subCommand = args[1];
        if (subCommand.startsWith('#')) {
            if(args.length > 2) {
                var subSubCommand = args[2];
                switch (subSubCommand) {
                    case 'refs':
                    {
                        ok = taskRefsSubCommand(ctx);
                        break;
                    }
                    case 'remove':
                    case 'delete':
                    case 'del':
                    {
                        ok = deleteTaskSubCommand(ctx);
                        break;
                    }
                    case 'set':
                    {
                        ok = taskSetSubCommand(ctx);
                        break;
                    }
                    default:
                    {
                        console.error("Invalid sub-sub-command: " + subSubCommand);
                        Ols.Message.systemErrorMessage(ctx.conversationId, 'Error: "' + subSubCommand + '" not recognised.  Type /task help for more info.');
                        ok = false;
                        break;
                    }
                }
            } else {
                Ols.Message.systemErrorMessage(ctx.conversationId, "This command will eventually show task details.  But it's not implemented yet! Come back in a few weeks and try again ;-)");
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
                /* TODO: This will need to be implemented as a client-side command.
                 case 'jump': { //example: /msg jump 5664
                 if(args.length > 2) {
                 var msgSeq = parseInt(args[2]);
                 if(msgSeq) {
                 FlowRouter.go('conversationPageStartSeq', {startMessageSeq: msgSeq});
                 } else {
                 Ols.Message.systemErrorMessage(ctx.conversationId, 'Error running msg jump command. Type /msg help for more info.');
                 }
                 } else {
                 Ols.Message.systemErrorMessage(ctx.conversationId, 'Invalid arguments for msg jump command. Type /msg help for more info.');
                 }
                 break;
                 }*/
                default:
                    Ols.Message.systemErrorMessage(ctx.conversationId, 'Invalid arguments for task command.  Type /task help for more info.');
                    ok = false;
                    break;

            }
        }
    } else {
        Ols.Message.systemErrorMessage(ctx.conversationId, 'Invalid arguments for command.  Type /task help for more info.');
    }
    return ok;
});

function addTaskSubCommand(ctx) {
    var ok = false;
    var args = ctx.args;
    if (args.length > 1) {
        var description = args.slice().splice(2).join(" ");
        Tasks.methods.addTask.call({
            description: description,
            conversationId: ctx.conversationId,
            messageId: ctx.message._id
        }, (err, task) => {
            if (err) {
                if (err.reason) {
                    Ols.Message.systemErrorMessage(ctx.conversationId, "Error adding task: " + err.reason);
                } else {
                    Ols.Message.systemErrorMessage(ctx.conversationId, "Error adding task: Unexpected error occurred");
                    throw Error('Internal error adding task: ' + err.message);
                }
                ok = false;
            } else {
                Ols.Message.systemSuccessMessage(ctx.conversationId, Meteor.user().username + " added task " + task.key + ": " + description);
                ok = true;
            }
        });
    }
    return ok;
}

function deleteTaskSubCommand(ctx) {
    var ok = false;
    var args = ctx.args;
    if (args.length > 1) {
        var key = parseInt(args[1].replace('#', ''));
        Tasks.methods.removeTask.call({conversationId: ctx.conversationId, key: key}, (err) => {
            if (err) {
                Ols.Message.systemErrorMessage(ctx.conversationId, "Error deleting task: " + err.reason);
                ok = false;
            } else {
                Ols.Message.systemSuccessMessage(ctx.conversationId, Meteor.user().username + " removed task #" + key);
                ok = true;
            }
        });
    }
    return ok;
}

function taskSetSubCommand(ctx) {
    /*
        Command Example: /task #12 set status:in-progress
    */
    var ok = false;
    var args = ctx.args;

    if (args.length > 2 && args[3].indexOf(':') != -1) {
        var key = parseInt(args[1].replace('#', ''));
        var data = args[3].split(':');
        var attr = data[0];
        var value = data[1];
        if (attr == 'status') {
            Tasks.methods.updateTaskStatus.call({
                conversationId: ctx.conversationId,
                key,
                value
            }, (err) => {
                if (err) {
                    Ols.Message.systemErrorMessage(ctx.conversationId, "Error changing task status: " + err.reason);
                    ok = false;
                } else {
                    Ols.Message.systemSuccessMessage(ctx.conversationId, Meteor.user().username + " set task #" + key + " status to '" + value + "'");
                    ok = true;
                }
            });
        } else {
            Ols.Message.systemErrorMessage(ctx.conversationId, 'Invalid arguments for task set command. ' + attr + 'is not a valid attribute. Type /task help for more info.');
            ok = false;
        }
    } else {
        Ols.Message.systemErrorMessage(ctx.conversationId, 'Invalid arguments for task set command. Type /task help for more info.');
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
    filter.conversationId = ctx.conversationId;

    var customMessageType = '/task.list';
    console.log('-- saving custom message (' + customMessageType + ') for conversation ' + ctx.conversationId);
    Meteor.call('saveMessage', {
        conversationId: ctx.conversationId,
        messageType: Ols.MESSAGE_TYPE_CUSTOM,
        customMessageType: customMessageType,
        tasks: Tasks.find(filter).fetch(),
        createdBy: Meteor.userId(),
        updatedBy: Meteor.userId(),
        createdByName: Meteor.user().username,
        updatedByName: Meteor.user().username
    }, function (err, msg) {
        if (err) {
            console.error("-- error saving task list custom message " + JSON.stringify(err));
            Ols.Message.systemErrorMessage(ctx.conversationId, 'Error running task list command. Could not generate task list. Type /task help for more info.');
            ok = false;
        } else {
            console.error("-- task list custom message " + msg.seq + " generated successfully.");
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
            console.log('-- saving custom message (' + customMessageType + ') for conversation ' + ctx.conversationId);
            Meteor.call('saveMessage', {
                conversationId: ctx.conversationId,
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
                    Ols.Message.systemErrorMessage(ctx.conversationId, 'Error running task refs command. Could not generate ref list. Type /task help for more info.');
                    ok = false;
                } else {
                    console.error("-- ref list custom message " + msg.seq + " generated successfully.");
                    ok = true;
                }
            });
        } else {
            Ols.Message.systemErrorMessage(ctx.conversationId, 'Error running task refs command. Could not parse key properly. Type /task help for more info.');
            ok = false;
        }
    } else {
        Ols.Message.systemErrorMessage(ctx.conversationId, 'Invalid arguments for task refs command. Type /task help for more info.');
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
