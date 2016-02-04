
if(Meteor.isServer) {
    ServerMessages = new Meteor.Collection('messages');

    Meteor.methods({
        loadMessages: function(opts) {
            console.log('loadMessages: ' + JSON.stringify(opts, null, 4));
            if(opts && opts.historyTs && opts.direction === 'back') {
                return ServerMessages.find({createdAt: {$lt: opts.historyTs}}, {
                    limit: opts.historyLimit,
                    sort: {createdAt: -1}
                }).fetch();
            } else if(opts && opts.historyTs && opts.direction === 'forward') {
                    return ServerMessages.find({createdAt: {$gt: opts.historyTs}}, {
                        limit: opts.historyLimit,
                        sort: {createdAt: 1}
                    }).fetch();
            } else {
                console.log('getting latest');
                return ServerMessages.find({}, {limit: opts.historyLimit, sort: {createdAt: -1}}).fetch();
            }
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

