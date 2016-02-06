
if(Meteor.isServer) {
    Counters = new Mongo.Collection('counters');
    ServerMessages = new Meteor.Collection('messages');

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
            console.log("> saveMessage(" + JSON.stringify(message, null, 2) + ")");
            message.seq = incrementCounter('counters', message.conversationId);
            console.log("-- message seq is " + message.seq);
            ServerMessages.insert(message);
            console.log("-- broadcasted new message " + message.seq + " to all clients");
            Streamy.broadcast('incomingMessage', message);
            console.log("< saveMessage()")
        }
    });
}

if(Meteor.isClient) {
    ClientMessages = new Meteor.Collection(null);
}

