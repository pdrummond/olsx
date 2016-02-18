LoopBotApi = function() {
    this.activeProcessList = {};
};

LoopBotApi.prototype.addActiveProcess = function(process) {
    this.activeProcessList[process.projectId] = process;
}

LoopBotApi.prototype.processExistsForProject = function(projectId) {
    var exists = this.activeProcessList[projectId] != null;
    console.log("processExistsForProject: " + exists);
    return exists;
};

LoopBotApi.prototype.executeResponseHandler = function(message, content) {
    var process = this.activeProcessList[message.projectId];
    if(process) {
        process.responseHandler(message, content);
        this.endActiveProcess(message.projectId);
    }
};

LoopBotApi.prototype.endActiveProcess = function(projectId) {
    delete this.activeProcessList[projectId];
};

/*
    Tell LoopBot to send a message that expects a response at some point
 */
LoopBotApi.prototype.promptMessage = function(opts) {
    console.log("promptMessage: " + JSON.stringify(opts));

    check(opts, {
        processName: String,
        projectId: String,
        content: String,
        responseHandler: Match.Any
    });
    var self = this;
    if (this.processExistsForProject(opts.projectId)) {
        Ols.LoopBot.errorMessage({
            projectId: opts.projectId,
            content: "Sorry, I'm not very good at doing two things at once.  Type `@loopbot cancel` first, then try again"
        });
    } else {
        Meteor.call('saveMessage', {
            projectId: opts.projectId,
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
                    projectId: opts.projectId,
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
        projectId: String,
        content: String
    });
    Meteor.call('saveMessage', {
        projectId: opts.projectId,
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
        projectId: String,
        content: String
    });
    Meteor.call('saveMessage', {
        projectId: opts.projectId,
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
        if(this.processExistsForProject(message.projectId)) {
            this.endActiveProcess(message.projectId);
            Ols.LoopBot.infoMessage({
                projectId: message.projectId,
                content: "Okay, I'll pretend it never happened ;-) Bye for now."
            });
        } else {
            Ols.LoopBot.infoMessage({
                projectId: message.projectId,
                content: "There is nothing to cancel - I'm not doing anything right now.  To be honest, I'm a bit bored."
            });
        }
    } else if(this.processExistsForProject(message.projectId)) {
        console.log("-- LOOPBOT has active process so treating message " + message.seq + " as the response");
        console.log("-- LOOPBOT is executing the active response handler now..");
        this.executeResponseHandler(message, content);
        console.log("-- LOOPBOT has finished executing the active response handler");
    } else {
        Ols.LoopBot.infoMessage({
            projectId: message.projectId,
            content: "Hey, " + Meteor.user().username + ". How's it going? I'm pretty thick so I only respond to specific commands.  Type `/help` to list a list of available commands."});
    }
};

Ols.LoopBot = new LoopBotApi;