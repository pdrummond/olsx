
if(Meteor.isServer) {
    ServerMessages = new Meteor.Collection('messages');

    Meteor.methods({
        loadMessages: function(opts) {
            console.log('> loadMessages(' + JSON.stringify(opts) + ')');
            var result = {
                showBackwardLink: false,
                showForwardLink: false,
                messages: []
            };
            if(opts && opts.historyTs && opts.historyMode === 'back') {
                console.log('-- getting older messages');
                result.messages = ServerMessages.find({conversationId: opts.conversationId, createdAt: {$lt: opts.historyTs}}, {
                    limit: opts.historyLimit,
                    sort: {createdAt: -1}
                }).fetch();
                console.log('-- found ' + result.messages.length + ' messages');
                if(result.messages.length > 0) {
                    var olderMessagesCount = ServerMessages.find({
                        conversationId: opts.conversationId,
                        createdAt: {$lt: result.messages.pop().createdAt}
                    }).count();
                    result.showBackwardLink = olderMessagesCount > 0;
                    console.log('-- detected ' + olderMessagesCount + ' older messages so showBackwardLink is ' + result.showBackwardLink);
                } else {
                    result.showBackwardLink = false;
                }
                result.showForwardLink = true;
            } else if(opts && opts.historyTs && opts.historyMode === 'forward') {
                console.log('-- getting newer messages');
                result.messages = ServerMessages.find({conversationId: opts.conversationId, createdAt: {$gt: opts.historyTs}}, {
                    limit: opts.historyLimit,
                    sort: {createdAt: 1}
                }).fetch();
                console.log('-- found ' + result.messages.length + ' messages');
                if(result.messages.length > 0) {
                    result.showBackwardLink = true;
                    var newerMessagesCount = ServerMessages.find({conversationId: opts.conversationId, createdAt: {$gt: result.messages.pop().createdAt}}).count();
                    result.showForwardLink = newerMessagesCount > 0;
                    console.log('-- detected ' + newerMessagesCount + ' newer messages so showForwardLink is ' + result.showForwardLink);
                } else {
                    result.showForwardLink = false;
                }
                result.showBackwardLink = true;
            } else {
                console.log('-- getting latest messages');
                result.messages = ServerMessages.find({conversationId: opts.conversationId}, {limit: opts.historyLimit, sort: {createdAt: -1}}).fetch();
                console.log('-- found ' + result.messages.length + ' messages');
                if(result.messages.length > 0) {
                    var olderMessagesCount = ServerMessages.find({
                        conversationId: opts.conversationId,
                        createdAt: {$lt: result.messages.pop().createdAt}
                    }).count();
                    result.showBackwardLink = olderMessagesCount > 0;
                    console.log('-- detected ' + olderMessagesCount + ' older messages so showBackwardLink is ' + result.showBackwardLink);
                } else {
                    result.showBackwardLink = false;
                }
                result.showForwardLink = false;
            }
            console.log('< loadMessages()');
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

