
if(Meteor.isServer) {

    Meteor.startup(function() {
        console.log('OpenLoops is booting..');
        var resetTestConversation = false;
        if(resetTestConversation) {
            Counters.remove({});
            ServerMessages.remove({});
            Conversations.remove({});

            var now = new Date();
            Projects.insert({
                _id: '1',
                title: 'Test Project',
                type: Ols.PROJECT_TYPE_CONVERSATION_DEFAULT,
                createdAt: now,
                updatedAt: now,
                createdBy: 'pdrummond',
                updatedBy: 'pdrummond',
                createdByName: 'pdrummond',
                updatedByName: 'pdrummond'
            }, (err) => {
                if(err) {
                    console.error('Error adding default project for conversation: ' + err);
                    throw new Meteor.Error("Conversations.methods.addConversation.add-default-project-failed", err);
                }
            });

            Conversations.insert({
                _id: '1',
                subject: 'Test Conversation',
                defaultProjectId: '1',
                createdAt: now,
                updatedAt: now,
                createdBy: 'pdrummond',
                updatedBy: 'pdrummond',
                createdByName: 'pdrummond',
                updatedByName: 'pdrummond'
            });

            for (let i = 1; i <= 5000; i++) {
                Meteor.call('saveMessage', {
                    conversationId: '1',
                    createdBy: 'pdrummond',
                    updatedBy: 'pdrummond',
                    createdByName: 'pdrummond',
                    updatedByName: 'pdrummond',
                    createdAt: now,
                    updatedAt: now,
                    content: 'Message ' + i
                });
                now.setSeconds(now.getSeconds() + 1);
            }
            console.log("Test Conversation reset. " + ServerMessages.find().count() + " test messages added.");
        } else {
            console.log('OpenLoops booted - total message count is ' + ServerMessages.find().count() + '.');
        }

    });
}


if(Meteor.isClient) {
    Accounts.ui.config({
        passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
    });
}

// Override Meteor._debug to filter for custom msgs - as used
// by yuukan:streamy (https://goo.gl/4HQiKg)
Meteor._debug = (function (super_meteor_debug) {
    return function (error, info) {
        if (!(info && _.has(info, 'msg')))
            super_meteor_debug(error, info);
    }
})(Meteor._debug);