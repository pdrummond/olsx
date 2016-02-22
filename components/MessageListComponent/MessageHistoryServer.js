
if(Meteor.isServer) {
    Meteor.methods({
        loadMessages: function(opts) {
            console.log('> loadMessages(' + JSON.stringify(opts) + ')');

            /*
                If no start message seq is provided, then we need to return the latest page of results.
             */
            if(opts.startMessageSeq == 0) {
                console.log('-- start message is 0 so finding latest page of messages...');

                var latestMessage = ServerMessages.findOne({projectId: opts.projectId}, {sort: {createdAt: -1}});
                if(latestMessage) {
                    var latestSeq = latestMessage.seq;
                    console.log('-- seq for latest message is ' + latestSeq);
                    opts.startMessageSeq = (latestSeq - opts.messagesCountLimit) + 1;
                    if (opts.startMessageSeq < 1) {
                        opts.startMessageSeq = 1;
                    }
                    console.log('-- start message seq for latest page is therefore ' + opts.startMessageSeq);
                } else {
                    console.log('-- There are no messages in this project so the seq is set to 1');
                    opts.startMessageSeq = 1;
                }
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

            result.messages = ServerMessages.find({projectId: opts.projectId, seq: {$gte: opts.startMessageSeq}}, {
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
                    projectId: opts.projectId,
                    seq: {$lt: result.messages[0].seq}
                }).count();

                var newerMessagesCount = ServerMessages.find({
                    projectId: opts.projectId,
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
                + ", projectId=" + message.projectId
                + ", content=" + (message.content ? Ols.StringUtils.truncate(message.content, 100) : ""));

                var commandName;
                //Need to detect command before saving the message to ensure message.isCommand = true
                //is persisted.
                //Commands are disabled for now - they may return later though
                /*if (message.content && message.content.startsWith('/')) {
                    console.log("-- message has been recognised as a command (" + message.content + ")");
                    var commandData = message.content.split(" ");
                    commandName = commandData[0];
                    message.isCommand = Ols.Command.commandExists(commandName);
                    if (message.isCommand) {
                        console.log("-- message is a recognised command and will be executed after message has been saved");
                    } else {
                        console.error("-- message is NOT a recognised command so will just be added as a normal chat message");
                    }
                }*/

                message = Meteor.call('insertAndBroadcastMessage', message);

                if (message.messageType == Ols.MESSAGE_TYPE_CHAT && !message.isCommand) {
                    //Only check for refs/mentions if message is a chat message and NOT a command (hashtags/at-signs are used
                    // in commands to identify messages, not reference them).
                    Meteor.call('detectRefsInMessage', message);

                    Meteor.call('detectMentionsInMessage', message);
                }

                //Commands are disabled for now - they may return later though
                /*if (commandName != null) {
                    console.log("-- command detected (" + message.content + ")");
                    if (message.isCommand) {
                        Ols.Command.executeCommand(commandName, commandData, message);
                    } else {
                        console.error("-- command is not valid (" + message.content + "). Generating error message...");
                        Meteor.call('systemErrorMessage', message.projectId, 'Invalid command: "' + commandName + "'");
                    }
                }
                if(message.content.startsWith("@loopbot")) {
                    console.log("-- Detected @loopbot at start of message " + message.seq);
                    console.log("-- Sending message " + message.seq + " to loopbot for further processing...");
                    Ols.LoopBot.onResponseReceived(message);
                }*/
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
            message.seq = Ols.Counter.getMessageCounter(message.projectId);
            console.log("-- saving message " + message.seq + "...");
            var messageId = ServerMessages.insert(message);
            console.log("-- message " + message.seq + " saved");
            message._id = messageId;
            console.log("-- broadcasting new message " + message.seq + " to all clients");
            Streamy.broadcast('incomingMessage', message);
            return message;
        },

        detectMentionsInMessage: function(message) {
            console.log("> detectMentionsInMessage");
            var re = /@([\w\.-]+)/g;
            var matches;

            do {
                matches = re.exec(message.content);
                if (matches && matches[1] != 'loopbot') {
                    var toUser = Meteor.users.findOne({username: matches[1]});
                    if(toUser != null) {
                        console.log("MENTION DETECTED: " + JSON.stringify(toUser));

                        var data = {
                            type: 'new-message-mention',
                            fromUserId: Meteor.userId(),
                            fromUsername: Meteor.user().username,
                            toUserId: toUser._id,
                            messageId: message._id,
                            messageContent: message.content
                        };
                        Streamy.sessionsForUsers(toUser._id).emit('mention', data);
                        //Streamy.broadcast('mention', data);
                    }
                }
            } while (matches);
            console.log("< detectMentionsInMessage");
        },

        detectRefsInMessage: function(message) {
            if(message.content) {
                console.log("-- checking for refs in message " + message.seq);
                var projectKey = Projects.findOne(message.projectId).key;
                console.log("-- project key for message " + message.seq + " is " + projectKey);
                var re = new RegExp('#' + projectKey + '-([\\d]+)', 'g');
                var matches;
                do {
                    matches = re.exec(message.content);
                    if (matches) {
                        var seq = parseInt(matches[1]);
                        console.log("-- ref to item " + seq + " found for message " + message.seq);
                        if (seq != null) {
                            var item = Items.findOne({projectId: message.projectId, seq, seq});
                            if (item != null) {
                                console.log("-- item found with seq " + seq + ".  Adding ref...");
                                Refs.methods.addRef.call({
                                    messageId: message._id,
                                    projectId: message.projectId,
                                    messageSeq: message.seq,
                                    messageContent: message.content,
                                    itemId: item._id,
                                    itemSeq: seq

                                }, (err, ref) => {
                                    if (err) {
                                        if (err.message) {
                                            console.error("Error adding ref: " + err.message);
                                        } else {
                                            console.error("- Error adding ref: " + err.reason);
                                        }
                                    } else {
                                        console.log("-- ref " + ref._id + " successfully created for item " + seq);
                                    }
                                });

                            }
                        } else {
                            console.log("-- No item found for " + seq + ".  Ignoring ref.");
                        }
                    } else {
                        console.log("-- no more refs found");
                    }
                } while (matches);
            } else {
                console.log("-- Ignoring ref detection in message " + message.seq + " as it has no content field");
            }
        },

        systemSuccessMessage: function(projectId, content, callback) {
            console.log("-- saving system success message for project " + projectId + ": " + content);
            return Meteor.call('insertAndBroadcastMessage', {
                projectId: projectId,
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

        systemErrorMessage: function(projectId, content) {
            console.log("-- saving system ERROR message for project " + projectId + ": " + content);
            return Meteor.call('insertAndBroadcastMessage', {
                projectId: projectId,
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
        },

        editMessage: function(messageId, content) {
            check(messageId, String);
            check(content, String);
            if (!this.userId) {
                throw new Meteor.Error("editMessage.not-authenticated");
            }
            var message = ServerMessages.findOne(messageId);
            if (message == null) {
                throw new Meteor.Error("editMessage.message-not-exist", "Message " + messageId + " does not exist");
            }
            var userIsAuthor = Meteor.userId() == message.createdBy;

            var member = Members.findOne({userId: Meteor.userId(), projectId: message.projectId});

            if(member == null || !userIsAuthor) {
                throw new Meteor.Error("editMessage.not-authorised", "Only project admins or the message author can edit messages");
            }

            ServerMessages.update(messageId, {
                $set: {content: content, isEdited: true, isDeleted:false, updatedAt: new Date()}
            });

            Ols.Message.systemSuccessMessage(message.projectId, Meteor.user().username + " edited message " + message.seq);

            //TODO: Need to do more than this to deal with refs properly
            //This deals with the most obvious case - editing a message in order to add a ref.
            //But what about if the message has a ref and its content changes (but the ref remains).
            //What about if the content changes and the ref is removed?
            //Need to deal with both of these cases.  Are there any more?
            message = ServerMessages.findOne(messageId);
            Meteor.call('detectRefsInMessage', message);

            return content;
        },

        deleteMessage: function(messageId) {
            check(messageId, String);

            if (!this.userId) {
                throw new Meteor.Error("deleteMessage.not-authenticated");
            }
            var message = ServerMessages.findOne(messageId);
            if (message == null) {
                throw new Meteor.Error("deleteMessage.message-not-exist", "Message " + messageId + " does not exist");
            }
            if(message.isDeleted) {
                throw new Meteor.Error("deleteMessage.message-already-deleted", "Message " + messageId + " is already deleted");
            }
            var userIsAuthor = Meteor.userId() == message.createdBy;

            var member = Members.findOne({userId: Meteor.userId(), projectId: message.projectId});

            if(member == null || !userIsAuthor) {
                throw new Meteor.Error("deleteMessage.not-authorised", "Only project admins or the message author can delete messages");
            }

            var deletedMessageContent = 'Message deleted by ' + Meteor.user().username + (userIsAuthor ? ' (author)': ' (admin)');

            ServerMessages.update(messageId, {
                $set: {content: deletedMessageContent, isDeleted:true, updatedAt: new Date()}
            });

            Ols.Message.systemSuccessMessage(message.projectId, Meteor.user().username + " deleted message " + message.seq);

            //TODO: Need to remove refs

            return deletedMessageContent;
        }
    });
}
