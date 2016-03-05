
MessageListContainer = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        projectId: React.PropTypes.string,
        startMessageSeq: React.PropTypes.number,
        messagesCountLimit: React.PropTypes.number,
        currentItem: React.PropTypes.object,
        onOtherProjectNewMessage: React.PropTypes.func
    },

    getInitialState() {
        return {
            messages: [],
            newMessages: [],
            incomingMessageCount:0
        }
    },

    componentDidMount: function () {
        //console.trace("MessageListContainer.componentDidMount");
    },

    componentDidUpdate: function () {
        //console.trace("MessageListContainer.componentDidUpdate");
    },

    getMeteorData() {
        //console.trace("MessageListContainer.getMeteorData");
        var self = this;
        Streamy.on('incomingMessage', function(msg) {
            console.log("incoming message received: " + JSON.stringify(msg, null, 4));

            /*
                When a new message arrives we need to determine if it lives in the current project.  If not, then
                it's a new message for another project and we need to show a notification badge in the left-sidebar.

                If it is for this project, then if the user is at the end of the history, then we can just add the
                msg, but if the user has scrolled back, we don't want to affect their position, so we show a
                "New Messages" toast instead.

                We also need to check for "detail mode" - if the message history is only showing the messages for
                one task, then being in the same project isn't good enough - we need to check that the message contains
                a ref to the item.  Rather than check the Refs collection which would be quite heavyweight, we just
                use a string comparison to test for the ref.  That is, unless the message is an activity message, in
                which case it will already have an itemId so we can just check for that instead.
             */
            var ok = false;
            if(msg.projectId == self.props.projectId) {
                ok = true;
            }
            if(ok && self.props.currentItem) {
                if(msg.itemId == self.props.currentItem._id) {
                    ok = true;
                } else {
                    var currentItemKey = '#' + self.props.currentItem.projectKey + '-' + self.props.currentItem.seq;
                    ok = msg.content.indexOf(currentItemKey) != -1;
                }
            }

            if(ok) {
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
        return {
        };
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
                projectType={this.props.projectType}
                onMessageAdded={this.onMessageAdded}
                onUserIsTyping={this.onUserIsTyping}
                onLoadOlderLinkClicked={this.onLoadOlderLinkClicked}
                onLoadNewerLinkClicked={this.onLoadNewerLinkClicked}
                onIncomingMessageToastClicked={this.onIncomingMessageToastClicked}
                onAddItem={this.props.onAddItem}
                />
        )
    },

    onIncomingMessageToastClicked: function() {
        Ols.Router.showProjectPageLatest({projectId: this.props.projectId}, {scrollBottom: true});
        this.setState({'messages': this.state.messages.concat(this.state.newMessages), incomingMessageCount: 0});
        this.scrollBottom();
    },

    onLoadNewerLinkClicked() {
        var self = this;
        var newestMessage = this.state.messages[this.state.messages.length-1];
        if(newestMessage) {
            Ols.Router.showProjectPageFromMessage({
                projectId: this.props.projectId,
                startMessageSeq: newestMessage.seq + 1
            }, {scrollBottom: false, scrollTop: false});
        }
    },

    onLoadOlderLinkClicked() {
        var oldestMessage = this.state.messages[0];
        var startMessageSeq = (oldestMessage.seq - this.props.messagesCountLimit) - 1;
        if(startMessageSeq < 1) {
            startMessageSeq = 1;
        }
        if(oldestMessage) {
            Ols.Router.showProjectPageFromMessage({
                projectId: this.props.projectId,
                startMessageSeq: startMessageSeq
            }, {scrollBottom: false, scrollTop: false});
        }
    },

    loadMessages(callback) {
        console.log("loadMessages");
        var self = this;

        Meteor.call('loadMessages', {
            projectId: this.props.projectId,
            startMessageSeq: this.props.startMessageSeq,
            messagesCountLimit: this.props.messagesCountLimit,
            currentItemSeq: this.getItemSeqFilter()
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

    getItemSeqFilter() {
        var itemSeq = null;
        if(this.props.messageFilter && this.props.messageFilter.length > 0) {

            var re = new RegExp("#" + this.props.projectKey + "-(\\d+)", "g");
            var match = re.exec(this.props.messageFilter);
            if(match != null) {
                var itemSeq = match[1].trim();
                if(itemSeq && itemSeq.length > 0) {
                    var seq = parseInt(itemSeq);
                    itemSeq = seq;
                }
            }
            console.log("getItemSeqFilter: " + itemSeq);
        }
        return itemSeq;
    },

    onUserIsTyping: function() {
        var userIds = Members.find({projectId: this.props.projectId}).map(function (member) {
            return member.userId;
        });
        Streamy.sessionsForUsers(userIds).emit('userIsTyping', {
            userId: Meteor.userId(),
            username: Meteor.user().username,
            projectId: this.props.projectId
        });
    },

    renderCurrentItemKey() {
        return "#" + this.props.currentItem.projectKey + "-" + this.props.currentItem.seq;
    },

    onMessageAdded:function(content) {
        if(this.props.currentItem) {
            content = this.renderCurrentItemKey() + ": " + content;
        }
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
