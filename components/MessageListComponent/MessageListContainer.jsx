
const DEFAULT_PAGE_SIZE = 30;

MessageListContainer = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        var self = this;
        Streamy.on('incomingMessage', function(msg) {
            console.log("incoming message received: " + JSON.stringify(msg, null, 4));
            var incomingMessageCount = 0;
            if(self.isInScrollBack()/* && msg.createdBy != Meteor.userId()*/) {
                incomingMessageCount = self.state.incomingMessageCount || 0;
                self.setState({ incomingMessageCount: incomingMessageCount+1});
            } else {
                self.setState({incomingMessageCount: 0, messages: self.state.messages.concat([msg])});
                self.scrollBottom();
            }
        });
        return {};
    },

    getInitialState() {
        return {
            messages: [],
            incomingMessageCount:0,
        }
    },

    render() {
        //console.log('render: state is ' + JSON.stringify(this.state, null, 4));
        return (
            <MessageList
                ref="messageList"
                messages={this.state.messages}
                showForwardLink={this.state.showForwardLink}
                showBackwardLink={this.state.showBackwardLink}
                incomingMessageCount={this.state.incomingMessageCount}
                onMessageAdded={this.onMessageAdded}
                onLoadOlderLinkClicked={this.onLoadOlderLinkClicked}
                onLoadNewerLinkClicked={this.onLoadNewerLinkClicked}
                onIncomingMessageToastClicked={this.onIncomingMessageToastClicked}
            />
        )
    },

    onIncomingMessageToastClicked: function() {
        /*if(this.getHistoryMode() != 'latest') {
            FlowRouter.go('conversationPageLatest', {historyMode: 'latest'});
        }*/
        this.scrollBottom();
    },

    onLoadNewerLinkClicked() {
        var self = this;
        var newestMessage = this.state.messages[this.state.messages.length-1];
        if(newestMessage) {
            FlowRouter.go('conversationPageStartSeq', {
                conversationId: this.props.conversationId,
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
            FlowRouter.go('conversationPageStartSeq', {
                conversationId: this.props.conversationId,
                startMessageSeq: startMessageSeq
            });
        }
    },

    loadMessages(callback) {
        console.log("loadMessages");
        var self = this;
        Meteor.call('loadMessages', {
            conversationId: this.props.conversationId,
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
            conversationId: this.props.conversationId,
            createdBy: Meteor.userId(),
            createdByName: Meteor.user().username,
            updatedBy: Meteor.userId(),
            updatedByName: Meteor.user().username,
            createdAt: new Date(),
            content: content
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

    scrollBottom: function() {
        this.refs.messageList.scrollBottom();
        this.setState({showForwardLink: false, incomingMessageCount:0});
    }

});
