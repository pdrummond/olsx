
const DEFAULT_PAGE_SIZE = 30;

MessageListContainer = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        var self = this;
        Streamy.on('incomingMessage', function(msg) {
            console.log("incoming message received: " + JSON.stringify(msg, null, 4));
            var incomingMessageCount = 0;
            if(self.isInScrollBack() && msg.createdBy != Meteor.user().username) {
                incomingMessageCount = self.state.incomingMessageCount || 0;
                self.setState({ incomingMessageCount: incomingMessageCount+1});
            } else {
                self.setState({messages: self.state.messages.concat([msg])});
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
        console.log('render: state is ' + JSON.stringify(this.state, null, 4));
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
        if(this.getHistoryMode() != 'latest') {
            FlowRouter.go('conversationPageLatest', {historyMode: 'latest'});
        }
        this.scrollBottom();
    },

    getConversationId() {
        return FlowRouter.getParam('conversationId');
    },

    getHistoryMode() {
        var historyMode = FlowRouter.getParam('historyMode');
        return historyMode?historyMode:'latest';
    },

    getHistoryTs() {
        var historyTs =  FlowRouter.getParam('historyTs');
        return historyTs ? parseInt(historyTs) : null;
    },

    getHistoryLimit() {
        let historyLimit = FlowRouter.getParam('historyLimit');
        historyLimit = historyLimit ? parseInt(historyLimit) : DEFAULT_PAGE_SIZE;
        return historyLimit;
    },

    componentDidMount: function() {
        console.trace("componentDidMount");
        this.loadMessages();
        this.scrollBottom();
    },

    componentDidUpdate: function() {
        console.trace("componentDidUpdate");
        if(this.getHistoryMode() == 'forward') {
            this.refs.messageList.scrollBottom();
        }
    },

    onLoadNewerLinkClicked() {
        var self = this;
        var newestMessage = this.state.messages.pop();
        let historyTs = newestMessage.createdAt;
        let historyLimit = this.getHistoryLimit();
        FlowRouter.go('conversationPageFrom', {historyMode: 'forward', historyTs: historyTs, historyLimit: historyLimit});
    },

    onLoadOlderLinkClicked() {
        var oldestMessage = this.state.messages[0];
        let historyTs = oldestMessage.createdAt;
        let historyLimit = this.getHistoryLimit();
        FlowRouter.go('conversationPageFrom', {historyMode: 'back', historyTs: historyTs, historyLimit: historyLimit});
    },

    loadMessages(callback) {

        console.log("loadMessages");
        var historyTs = this.getHistoryTs();
        var historyLimit =this.getHistoryLimit();
        var historyMode = this.getHistoryMode();
        var conversationId = this.getConversationId();
        var self = this;
        Meteor.call('loadMessages', {
            conversationId: conversationId,
            historyTs,
            historyLimit,
            historyMode
        }, function (err, result) {
            if (err) {
                toastr.error('Error loading messages', err.reason);
            } else {
                ClientMessages._collection.remove({});
                _.each(result.messages, function (message) {
                    ClientMessages.insert(message);
                });
                var clientMessages = ClientMessages.find({}, {sort: {createdAt: 1}}).fetch();
                self.setState({messages: clientMessages, showBackwardLink: result.showBackwardLink, showForwardLink: result.showForwardLink});
                if(callback) {
                    callback();
                }
            }
        });
    },

    onMessageAdded:function(content) {
        let msg = this.insertClientMessage(content);
        Meteor.call('saveMessage',msg, function(err, result) {
            if(err) {
                toastr.error('Something went wrong saving message', err.reason);
            }
            Streamy.broadcast('incomingMessage', msg);
        });
        if(this.getHistoryMode() != 'latest') {
            FlowRouter.go('conversationPageLatest', {historyMode: 'latest'});
        }
        this.setState({incomingMessageCount: 0});
    },

    insertClientMessage(content) {
        var message = {
            conversationId: this.getConversationId(),
            createdBy: Meteor.userId(),
            createdByName: Meteor.user().username,
            updatedBy: Meteor.userId(),
            updatedByName: Meteor.user().username,
            createdAt: new Date().getTime(),
            content: content
        };
        var messageId = ClientMessages.insert(message);
        return _.extend(message, {_id: messageId});
    },

    isInScrollBack: function() {
        var inScrollBack = this.getHistoryMode() != 'latest';
        if(!inScrollBack) {
           /*
                If showing latest messages, but user has scrolled up then
                this is also considered 'scroll back' so check for this here
           */
            inScrollBack = !this.refs.messageList.isScrollBottom();
        }
        return inScrollBack;
    },

    scrollBottom: function() {
        this.refs.messageList.scrollBottom();
        this.setState({showForwardLink: false, incomingMessageCount:0});
    }

});
