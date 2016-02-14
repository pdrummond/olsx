LoopBotApi = function() {
    this.activeProcessList = {};
};

LoopBotApi.prototype.addActiveProcess = function(process) {
    this.activeProcessList[process.conversationId] = process;
}

LoopBotApi.prototype.processExistsForConversation = function(conversationId) {
    var exists = this.activeProcessList[conversationId] != null;
    console.log("processExistsForConversation: " + exists);
    return exists;
};

LoopBotApi.prototype.executeResponseHandler = function(message, content) {
    var process = this.activeProcessList[message.conversationId];
    if(process) {
        process.responseHandler(message, content);
        this.endActiveProcess(message.conversationId);
    }
};

LoopBotApi.prototype.endActiveProcess = function(conversationId) {
    delete this.activeProcessList[conversationId];
};

/*
    Tell LoopBot to send a message that expects a response at some point
 */
LoopBotApi.prototype.promptMessage = function(opts) {
    console.log("promptMessage: " + JSON.stringify(opts));

    check(opts, {
        processName: String,
        conversationId: String,
        content: String,
        responseHandler: Match.Any
    });
    var self = this;
    if (this.processExistsForConversation(opts.conversationId)) {
        Ols.LoopBot.errorMessage({
            conversationId: opts.conversationId,
            content: "Sorry, I'm not very good at doing two things at once.  Type `@loopbot cancel` first, then try again"
        });
    } else {
        Meteor.call('saveMessage', {
            conversationId: opts.conversationId,
            content: opts.content,
            messageType: Ols.MESSAGE_TYPE_LOOPBOT,
            messageSubType: Ols.MESSAGE_SUBTYPE_LOOPBOT_PROMPT,
            createdBy: Ols.LOOPBOT_USERID,
            updatedBy: Ols.LOOPBOT_USERID,
            createdByName: Ols.LOOPBOT_USERNAME,
            updatedByName: Ols.LOOPBOT_USERNAME
        }, function (err, msg) {
            if (err) {
                console.error("-- error saving loopbot message " + msg.seq);
            } else {
                console.error("-- loopbot message " + msg.seq + " saved successfully.");
                self.addActiveProcess({
                    conversationId: opts.conversationId,
                    processName: opts.processName,
                    responseHandler: opts.responseHandler
                });
            }
        });
    }

};

/*
    Tell loopbot to send a info-only message.
 */
LoopBotApi.prototype.infoMessage = function(opts, callback) {
    check(opts, {
        conversationId: String,
        content: String
    });
    Meteor.call('saveMessage', {
        conversationId: opts.conversationId,
        content: opts.content,
        messageType: Ols.MESSAGE_TYPE_LOOPBOT,
        messageSubType: Ols.MESSAGE_SUBTYPE_LOOPBOT_INFO,
        createdBy: Ols.LOOPBOT_USERID,
        updatedBy: Ols.LOOPBOT_USERID,
        createdByName: Ols.LOOPBOT_USERNAME,
        updatedByName: Ols.LOOPBOT_USERNAME
    }, function (err, msg) {
        if(err) {
            console.error("-- error saving loopbot INFO message: " + JSON.stringify(err));
        } else {
            console.error("-- loopbot INFO message " + msg.seq + " saved successfully.");
        }
        if(callback) {
            callback(err, msg);
        }
    });
};

/*
 Tell loopbot to send a info-only message.
 */
LoopBotApi.prototype.errorMessage = function(opts, callback) {
    check(opts, {
        conversationId: String,
        content: String
    });
    Meteor.call('saveMessage', {
        conversationId: opts.conversationId,
        content: opts.content,
        messageType: Ols.MESSAGE_TYPE_LOOPBOT,
        messageSubType: Ols.MESSAGE_SUBTYPE_LOOPBOT_ERROR,
        createdBy: Ols.LOOPBOT_USERID,
        updatedBy: Ols.LOOPBOT_USERID,
        createdByName: Ols.LOOPBOT_USERNAME,
        updatedByName: Ols.LOOPBOT_USERNAME
    }, function (err, msg) {
        if(err) {
            console.error("-- error saving loopbot ERROR message " + msg.seq);
        } else {
            console.error("-- loopbot ERROR message " + msg.seq + " saved successfully.");
        }
        if(callback) {
            callback(err, msg);
        }
    });

};

LoopBotApi.prototype.onResponseReceived = function(message) {
    console.log("-- LOOPBOT received message " + message.seq + ": " + message.content);
    var content = message.content.replace("@loopbot", "").trim();
    if(content == "cancel") {
        if(this.processExistsForConversation(message.conversationId)) {
            this.endActiveProcess(message.conversationId);
            Ols.LoopBot.infoMessage({
                conversationId: message.conversationId,
                content: "Okay, I'll pretend it never happened ;-) Bye for now."
            });
        } else {
            Ols.LoopBot.infoMessage({
                conversationId: message.conversationId,
                content: "There is nothing to cancel - I'm not doing anything right now.  To be honest, I'm a bit bored."
            });
        }
    } else if(this.processExistsForConversation(message.conversationId)) {
        console.log("-- LOOPBOT has active process so treating message " + message.seq + " as the response");
        console.log("-- LOOPBOT is executing the active response handler now..");
        this.executeResponseHandler(message, content);
        console.log("-- LOOPBOT has finished executing the active response handler");
    } else {
        Ols.LoopBot.infoMessage({
            conversationId: message.conversationId,
            content: "Hey, " + Meteor.user().username + ". How's it going? I'm pretty thick so I only respond to specific commands.  Type `/help` to list a list of available commands."});
    }
};

Ols.LoopBot = new LoopBotApi;