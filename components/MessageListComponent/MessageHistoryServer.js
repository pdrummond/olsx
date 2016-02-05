
if(Meteor.isServer) {
    ServerMessages = new Meteor.Collection('messages');

    Meteor.methods({
        loadMessages: function(opts) {
            var result = {
                showBackwardLink: false,
                showForwardLink: false,
                messages: []
            };
            var getLatest = false;

            if(opts && opts.historyMode == 'latest') {
                getLatest = true;
            }
            console.log('loadMessages: ' + JSON.stringify(opts, null, 4));
            if(opts && opts.historyTs && opts.historyMode === 'back') {
                result.messages = ServerMessages.find({conversationId: opts.conversationId, createdAt: {$lt: opts.historyTs}}, {
                    limit: opts.historyLimit,
                    sort: {createdAt: -1}
                }).fetch();

                if(result.messages.length > 0) {
                    result.showBackwardLink = ServerMessages.find({conversationId: opts.conversationId, createdAt: {$lt: result.messages[0].createdAt}}).count() > 0;
                    result.showForwardLink = true;
                } else {
                    getLatest = true;
                }
            } else if(opts && opts.historyTs && opts.historyMode === 'forward') {
                result.messages = ServerMessages.find({conversationId: opts.conversationId, createdAt: {$gt: opts.historyTs}}, {
                    limit: opts.historyLimit,
                    sort: {createdAt: 1}
                }).fetch();

                if(result.messages.length > 0) {
                    result.showBackwardLink = true;
                    result.showForwardLink = ServerMessages.find({conversationId: opts.conversationId, createdAt: {$gt: result.messages.pop().createdAt}}).count() > 0;
                } else {
                    getLatest = true;
                }
            }
            if(getLatest) {
                console.log('getting latest');
                result.messages = ServerMessages.find({conversationId: opts.conversationId}, {limit: opts.historyLimit, sort: {createdAt: -1}}).fetch();
                if(result.messages.length > 0) {
                    result.showBackwardLink = ServerMessages.find({
                            conversationId: opts.conversationId,
                            createdAt: {$lt: result.messages[0].createdAt}
                        }).count() > 0;
                } else {
                    result.showBackwardLink = false;
                }
                result.showForwardLink = false;
            }
            return result;
        },

        saveMessage: function(message) {
            console.log("saveMessage: " + JSON.stringify(message, null, 4));
            return ServerMessages.insert(message);
        }
    });
}

if(Meteor.isClient) {
    ClientMessages = new Meteor.Collection(null);
}

