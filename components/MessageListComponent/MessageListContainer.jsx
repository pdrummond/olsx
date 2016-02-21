
MessageListContainer = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        projectId: React.PropTypes.string,
        startMessageSeq: React.PropTypes.number,
        messagesCountLimit: React.PropTypes.number,

        onOtherProjectNewMessage: React.PropTypes.func
    },

    getInitialState() {
        return {
            messages: [],
            newMessages: [],
            incomingMessageCount:0
        }
    },

    getMeteorData() {
        var self = this;
        Streamy.on('incomingMessage', function(msg) {
            console.log("incoming message received: " + JSON.stringify(msg, null, 4));
            if(msg.projectId == self.props.projectId) {
                var incomingMessageCount = 0;
                if (self.isInScrollBack()/* && msg.createdBy != Meteor.userId()*/) {
                    incomingMessageCount = self.state.incomingMessageCount || 0;
                    self.setState({newMessages: self.state.newMessages.concat([msg]), incomingMessageCount: incomingMessageCount + 1});
                } else {
                    /*
                     Might need to improve this - it works for now but not ideal.

                     Basically, we want to add the incoming message if it wasn't a chat message
                     created by the current user, because in that situation the message is added by the user
                     instantly before the server round-trip.  But if the chat message is from another user we
                     want to add it, and if the message is NOT a chat message then we want to add it.

                     But "not a chat message" isn't really the correct logic.  Really, we want to distinguish between
                     messages that originated on the client and messages that originate on the server.  If on the server
                     we want to display them, if on the client, then the client will take care of adding them so we
                     don't have to do it here.

                     Need to think about this some more as I work on the app, then at some point hopefully I'll do the
                     right thing here.
                     */
                    if (msg.messageType != Ols.MESSAGE_TYPE_CHAT || msg.createdBy != Meteor.userId()) {
                        self.setState({incomingMessageCount: 0, messages: self.state.messages.concat([msg])});
                        self.scrollBottom();
                    }
                }
            } else {
                self.props.onOtherProjectNewMessage(msg);
            }
        });
        return {};
    },

    render() {
        return (
            <MessageList
                ref="messageList"
                messages={this.state.messages}
                showForwardLink={this.state.showForwardLink}
                showBackwardLink={this.state.showBackwardLink}
                incomingMessageCount={this.state.incomingMessageCount}
                projectId={this.props.projectId}
                onMessageAdded={this.onMessageAdded}
                onUserIsTyping={this.onUserIsTyping}
                onLoadOlderLinkClicked={this.onLoadOlderLinkClicked}
                onLoadNewerLinkClicked={this.onLoadNewerLinkClicked}
                onIncomingMessageToastClicked={this.onIncomingMessageToastClicked}
            />
        )
    },

    onIncomingMessageToastClicked: function() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {scrollBottom: true});
        this.setState({'messages': this.state.messages.concat(this.state.newMessages), incomingMessageCount: 0});
        this.scrollBottom();
    },

    onLoadNewerLinkClicked() {
        var self = this;
        var newestMessage = this.state.messages[this.state.messages.length-1];
        if(newestMessage) {
            FlowRouter.go('projectPageStartSeq', {
                projectId: this.props.projectId,
                startMessageSeq: newestMessage.seq + 1
            });
        }
    },

    onLoadOlderLinkClicked() {
        var oldestMessage = this.state.messages[0];
        var startMessageSeq = (oldestMessage.seq - this.props.messagesCountLimit) - 1;
        if(startMessageSeq < 1) {
            startMessageSeq = 1;
        }
        if(oldestMessage) {
            FlowRouter.go('projectPageStartSeq', {
                projectId: this.props.projectId,
                startMessageSeq: startMessageSeq
            });
        }
    },

    loadMessages(callback) {
        console.log("loadMessages");
        var self = this;
        Meteor.call('loadMessages', {
            projectId: this.props.projectId,
            startMessageSeq: this.props.startMessageSeq,
            messagesCountLimit: this.props.messagesCountLimit
        }, function (err, result) {
            if (err) {
                toastr.error('Error loading messages', err.reason);
            } else {
                ClientMessages._collection.remove({});
                _.each(result.messages, function (message) {
                    ClientMessages.insert(message);
                });
                var clientMessages = ClientMessages.find({}, {sort: {seq: 1}}).fetch();
                self.setState({messages: clientMessages, showBackwardLink: result.showBackwardLink, showForwardLink: result.showForwardLink});
                if(callback) {
                    callback();
                }
            }
        });
    },

    onUserIsTyping: function() {
        Streamy.broadcast('userIsTyping', {
            userId: Meteor.userId(),
            username: Meteor.user().username,
            projectId: this.props.projectId
        });
    },

    onMessageAdded:function(content) {
        let msg = this.insertClientMessage(content);
        if(!this.isInScrollBack()) {
            this.setState({incomingMessageCount: 0, messages: this.state.messages.concat([msg])});
            this.scrollBottom(function() {
                Meteor.call('saveMessage', msg, function(err, result) {
                    if(err) {
                        toastr.error('Something went wrong saving message', err.reason);
                    }
                });
            });
        } else {
            Meteor.call('saveMessage', msg, function(err, result) {
                if(err) {
                    toastr.error('Something went wrong saving message', err.reason);
                }
            });
        }

    },

    insertClientMessage(content) {
        var message = {
            projectId: this.props.projectId,
            createdBy: Meteor.userId(),
            createdByName: Meteor.user().username,
            updatedBy: Meteor.userId(),
            updatedByName: Meteor.user().username,
            createdAt: new Date(),
            updatedAt: new Date(),
            content: content,
            messageType: Ols.MESSAGE_TYPE_CHAT
        };
        var messageId = ClientMessages.insert(message);
        return _.extend(message, {_id: messageId});
    },

    isInScrollBack: function() {
        var inScrollBack = false;//this.getHistoryMode() != 'latest';
        if(!inScrollBack) {
           /*
                If showing latest messages, but user has scrolled up then
                this is also considered 'scroll back' so check for this here
           */
            inScrollBack = !this.refs.messageList.isScrollBottom();
        }
        console.log('inScrollBack = ' + inScrollBack);
        return inScrollBack;
    },

    scrollBottom: function(callback) {
        this.refs.messageList.scrollBottom(callback);
        this.setState({ incomingMessageCount: 0});
    },

    scrollTop: function() {
        this.refs.messageList.scrollTop();
    }

});
