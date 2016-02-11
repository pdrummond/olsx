
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
        default:
            Ols.Message.systemErrorMessage(ctx.conversationId, 'Invalid arguments for task command.  Type /task help for more info.');
            break;
    }
});

MessageListComponent = React.createClass({
    render() {
        //console.log("MessageListComponent render(" + JSON.stringify(this.props, null, 2) + ")");
        if(this.props.ctx.tasks.length > 0) {
            var key=400;
            return (
                <li className="message-item">
                    <table>
                        <tbody>
                        <tr>
                            <th>Key</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Description</th>
                        </tr>
                        {this.props.ctx.tasks.map(function (task) {
                            return (
                                <tr>
                                    <td>{task.key}</td>
                                    <td>{task.status}</td>
                                    <td>by {task.createdByName} {moment(task.createdAt).fromNow()}</td>
                                    <td>{task.description}</td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </li>
            );
        } else {
            return (
              <li>
                  <i>You have no tasks - use <code>'/task add'</code> to create one.</i>
              </li>
            );

        }
    }
});

Ols.Command.defineComponent('/task.list', function(ctx) {
    return <MessageListComponent key={ctx.key} ctx={ctx}/>;
});

