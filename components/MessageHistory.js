
if(Meteor.isServer) {
    ServerMessages = new Meteor.Collection('messages');

    Meteor.methods({
        loadMessages: function(opts) {
            console.log('loadMessages: ' + JSON.stringify(opts, null, 4));
            if(opts && opts.historyFrom) {
                return ServerMessages.find({createdAt: {$lt: opts.historyFrom}}, {
                    limit: opts.historyLimit,
                    sort: {createdAt: -1}
                }).fetch();
            } else {
                return ServerMessages.find({}, {sort: {createdAt: -1}}).fetch();
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

