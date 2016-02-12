
Ols.Command.defineCommand('/task', function(ctx) {
    var args = ctx.args;
    switch (args[1]) {
        case 'add':
            if(args.length > 1) {
                var description = args.slice().splice(2).join(" ");
                Tasks.methods.addTask.call({description: description, conversationId: ctx.conversationId, messageId: ctx.message._id}, (err, task) => {
                    if(err) {
                        if(err.reason) {
                            Ols.Message.systemErrorMessage(ctx.conversationId, "Error adding task: " + err.reason);
                        } else {
                            Ols.Message.systemErrorMessage(ctx.conversationId, "Error adding task: Unexpected error occurred");
                            throw Error('Internal error adding task: ' + err.message);
                        }
                    } else {
                        Ols.Message.systemSuccessMessage(ctx.conversationId, Meteor.user().username + " added task " + task.key + ": " + description);
                    }
                });
            }
            break;
        case 'del': { // /task del 1
            if (args.length > 1) {
                var key = parseInt(args[2]);
                Tasks.methods.removeTask.call({conversationId: ctx.conversationId, key: key}, (err) => {
                    if (err) {
                        Ols.Message.systemErrorMessage(ctx.conversationId, "Error deleting task: " + err.reason);
                    } else {
                        Ols.Message.systemSuccessMessage(ctx.conversationId, Meteor.user().username + " removed task #" + key);
                    }
                });
            }
            break;
            }
        case 'list': //example: /task list status:in-progress
            var filter = {};
            if(args.length > 2) {
               filter = Ols.Filter.parseString(args[2]);
            }
            filter.conversationId = ctx.conversationId;
            Ols.Message.saveCustomMessage('/task.list', ctx.conversationId, {
                tasks: Tasks.find(filter).fetch()
            });
            break;
        case 'set': //example: /task set key status:in-progress
            if(args.length > 2 && args[3].indexOf(':') != -1) {
                var key = parseInt(args[2]);
                var data = args[3].split(':');
                var attr = data[0];
                var value = data[1];
                if(attr == 'status') {
                    Tasks.methods.updateTaskStatus.call({conversationId: ctx.conversationId, key, value}, (err) => {
                      if(err) {
                          Ols.Message.systemErrorMessage(ctx.conversationId, "Error changing task status: " + err.reason);
                      } else {
                         Ols.Message.systemSuccessMessage(ctx.conversationId, Meteor.user().username + " set task #" + key + " status to '" + value + "'");
                      }
                    });
                } else {
                    Ols.Message.systemErrorMessage(ctx.conversationId, 'Invalid arguments for task set command. ' + attr + 'is not a valid attribute. Type /task help for more info.');
                }
            } else {
                Ols.Message.systemErrorMessage(ctx.conversationId, 'Invalid arguments for task set command. Type /task help for more info.');
            }
            break;
        case 'refs': { //example: /task refs 42
            var filter = {};
            if (args.length > 2) {
                var taskKey = parseInt(args[2]);
                if (taskKey) {
                    var refList = Refs.find({taskKey: taskKey}).fetch();
                    console.log("/task refList: " + JSON.stringify(refList, null, 2));
                    Ols.Message.saveCustomMessage('/task.refs', ctx.conversationId, {
                        taskKey: taskKey,
                        refs: refList
                    });
                } else {
                    Ols.Message.systemErrorMessage(ctx.conversationId, 'Error running task refs command. Type /task help for more info.');
                }
            } else {
                Ols.Message.systemErrorMessage(ctx.conversationId, 'Invalid arguments for task refs command. Type /task help for more info.');
            }
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
            break;
    }
});

Ols.Command.defineComponent('/task.list', function(ctx) {
    return <TaskListMessage key={ctx.key} ctx={ctx}/>;
});

Ols.Command.defineComponent('/task.refs', function(ctx) {
    return <RefListMessage key={ctx.key} ctx={ctx}/>;
});
