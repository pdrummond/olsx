
if(Meteor.isServer) {
    Meteor.methods({
        loadMessages: function(opts) {
            console.log('> loadMessages(' + JSON.stringify(opts) + ')');

            /*
                First task is to determine the latest page of messages if a start seq isn't provided. The latest
                page is the total number of messages in the conversation minus the messagesCountLimit.
             */
            var conversationMessageCount = ServerMessages.find({conversationId: opts.conversationId}).count();
            console.log('-- Conversation has ' + conversationMessageCount + ' messages in total');

            var latestMessage = ServerMessages.findOne({conversationId: opts.conversationId, seq: conversationMessageCount});
            console.log('-- Latest message is ' + JSON.stringify(latestMessage, null, 4));

            if(opts.startMessageSeq == 0) {
                console.log('-- start message is 0 so finding latest page of messages...');
                console.log('-- conversation message count is ' + conversationMessageCount);
                opts.startMessageSeq = (conversationMessageCount - opts.messagesCountLimit)+1;
                if(opts.startMessageSeq < 1) {
                    opts.startMessageSeq = 1;
                }
                console.log('-- start message seq for latest page is therefore ' + opts.startMessageSeq);
            }

            /*
                This result structure id returned to the client.  It consists of the page of messages, and two booleans
                which define whether the back and forward links will be displayed.
             */

            var result = {
                showBackwardLink: false,
                showForwardLink: false,
                messages: []
            };

            /*
                Fetch a page of messages.  A page has a length of opts.messagesCountLimit and begins with the
                message with a seq of opts.startMessageSeq.
             */

            result.messages = ServerMessages.find({conversationId: opts.conversationId, seq: {$gte: opts.startMessageSeq}}, {
                limit: opts.messagesCountLimit+1,
                sort: {seq: 1}
            }).fetch();
            console.log("-- Fetched " + result.messages.length + " messages for this page");

            console.log('-- Latest page message is: ' + JSON.stringify(result.messages[result.messages.length-1], null, 4));

            /*
                Now we need to see if there are any older/newer messages than the current page in order to determine
                whether the back and forward links are shown.
             */

            if(result.messages && result.messages.length > 0) {

                var olderMessagesCount = ServerMessages.find({
                    conversationId: opts.conversationId,
                    seq: {$lt: result.messages[0].seq}
                }).count();

                var newerMessagesCount = ServerMessages.find({
                    conversationId: opts.conversationId,
                    seq: {$gt: result.messages[result.messages.length-1].seq}
                }).count();

                result.showBackwardLink = olderMessagesCount > 0;
                result.showForwardLink = newerMessagesCount > 0;
            }

            console.log("< loadMessages()");
            return result;
        },

        saveMessage: function(message) {
            try {
                console.log("> saveMessage(). "
                + "messageType=" + message.messageType
                + ", conversationId=" + message.conversationId
                + ", content=" + message.content ? Ols.StringUtils.truncate(message.content, 100) : "");

                var commandName;
                //Need to detect command before saving the message to ensure message.isCommand = true
                //is persisted.
                if (message.content && message.content.startsWith('/')) {
                    console.log("-- message has been recognised as a command (" + message.content + ")");
                    var commandData = message.content.split(" ");
                    commandName = commandData[0];
                    message.isCommand = Ols.Command.commandExists(commandName);
                    if (message.isCommand) {
                        console.log("-- message is a recognised command and will be executed after message has been saved");
                    } else {
                        console.error("-- message is NOT a recognised command so will just be added as a normal chat message");
                    }
                }

                message = Meteor.call('insertAndBroadcastMessage', message);

                if (message.messageType == Ols.MESSAGE_TYPE_CHAT && message.isCommand == false) {
                    //Only check for refs if message is a chat message and NOT a command (hashtags are used
                    // in commands to identify messages, not reference them).
                    Meteor.call('detectRefsInMessage', message);
                }

                if (commandName != null) {
                    console.log("-- command detected (" + message.content + ")");
                    if (message.isCommand) {
                        Ols.Command.executeCommand(commandName, commandData, message);
                    } else {
                        console.error("-- command is not valid (" + message.content + "). Generating error message...");
                        Meteor.call('systemErrorMessage', message.conversationId, 'Invalid command: "' + commandName + "'");
                    }
                }
                console.log("< saveMessage()");
                return message;
            } catch(err) {
                console.error("Unexpected exception in MessageHistoryServer.saveMessage: " + err.type);
                console.error("Error JSON: " + JSON.stringify(err));
            }
        },

        insertAndBroadcastMessage: function(message) {
            var now = new Date();
            message.createdAt = now;
            message.updatedAt = now;
            message.seq = incrementCounter('counters', message.conversationId);
            console.log("-- saving message " + message.seq + "...");
            var messageId = ServerMessages.insert(message);
            console.log("-- message " + message.seq + " saved");
            message._id = messageId;
            console.log("-- broadcasting new message " + message.seq + " to all clients");
            Streamy.broadcast('incomingMessage', message);
            return message;
        },

        detectRefsInMessage: function(message) {
            if(message.content) {
                var re = /#([\d]+)/g;
                var matches;
                console.log("-- checking for refs in message " + message.seq);
                do {
                    matches = re.exec(message.content);
                    if (matches) {
                        var key = parseInt(matches[1]);
                        console.log("-- ref to task " + key + " found for message " + message.seq);
                        if (key != null) {
                            var task = Tasks.findOne({conversationId: message.conversationId, key: key});
                            if (task != null) {
                                console.log("-- task found for key " + key + ".  Adding ref...");
                                Refs.methods.addRef.call({
                                    messageId: message._id,
                                    messageSeq: message.seq,
                                    messageContent: message.content,
                                    taskId: task._id,
                                    taskKey: key

                                }, (err, ref) => {
                                    if (err) {
                                        if (err.message) {
                                            console.error("Error adding ref: " + err.message);
                                        } else {
                                            console.error("- Error adding ref: " + err.reason);
                                        }
                                    } else {
                                        console.log("-- ref " + ref._id + " successfully created for task " + key);
                                    }
                                });

                            }
                        } else {
                            console.log("-- No task found for " + key + ".  Ignoring ref.");
                        }
                    } else {
                        console.log("-- no more refs found");
                    }
                } while (matches);
            } else {
                console.log("-- Ignoring ref detection in message " + message.seq + " as it has no content field");
            }
        },

        systemSuccessMessage: function(conversationId, content) {
            console.log("-- saving system success message for conversation " + conversationId + ": " + content);
            Meteor.call('insertAndBroadcastMessage', {
                conversationId: conversationId,
                createdBy: Ols.SYSTEM_USERID,
                createdByName: Ols.SYSTEM_USERNAME,
                updatedBy: Ols.SYSTEM_USERID,
                updatedByName: Ols.SYSTEM_USERNAME,
                createdAt: new Date(),
                content: content,
                messageType: Ols.MESSAGE_TYPE_SYSTEM,
                isSystem: true,
                isSuccess: true
            });
            console.log("-- system success message saved");
        },

        systemErrorMessage: function(conversationId, content) {
            console.log("-- saving system ERROR message for conversation " + conversationId + ": " + content);
            Meteor.call('insertAndBroadcastMessage', {
                conversationId: conversationId,
                createdBy: Ols.SYSTEM_USERID,
                createdByName: Ols.SYSTEM_USERNAME,
                updatedBy: Ols.SYSTEM_USERID,
                updatedByName: Ols.SYSTEM_USERNAME,
                createdAt: new Date(),
                content: content,
                messageType: Ols.MESSAGE_TYPE_SYSTEM,
                isSystem: true,
                isError: true
            });
            console.log("-- system error message saved");
        }
    });
}


