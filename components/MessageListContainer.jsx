
const DEFAULT_PAGE_SIZE = 30;

MessageListContainer = React.createClass({

    getInitialState() {
        return {
            messages: []
        }
    },

    render() {
        return (
            <MessageList
                ref="messageList"
                messages = {this.state.messages}
                onMessageAdded = {this.onMessageAdded}
                onLoadOlderLinkClicked = {this.onLoadOlderLinkClicked}
                onLoadNewerLinkClicked = {this.onLoadNewerLinkClicked}
            />
        )
    },

    getHistoryLimit() {
        let historyLimit = FlowRouter.getParam('historyLimit');
        historyLimit = historyLimit ? parseInt(historyLimit) : DEFAULT_PAGE_SIZE;
        return historyLimit;
    },

    componentDidMount: function() {
        console.trace("componentDidMount");
        let historyTs = FlowRouter.getParam('historyTs');
        historyTs = historyTs ? parseInt(historyTs) : null;
        let historyLimit = this.getHistoryLimit();
        this.loadMessages(historyTs, historyLimit, 'back');
    },

    componentDidUpdate: function() {
        console.trace("componentDidUpdate");
    },

    onLoadNewerLinkClicked() {
        var self = this;
        var newestMessage = this.state.messages.pop();
        let historyTs = newestMessage.createdAt;
        let historyLimit = this.getHistoryLimit();
        FlowRouter.go('conversationPageFrom', {historyTs: historyTs, historyLimit: historyLimit});
        this.loadMessages(historyTs, historyLimit, 'forward', function() {
            self.refs.messageList.scrollBottom();
        });

    },

    onLoadOlderLinkClicked() {
        var oldestMessage = this.state.messages[0];
        let historyTs = oldestMessage.createdAt;
        let historyLimit = this.getHistoryLimit();
        FlowRouter.go('conversationPageFrom', {historyTs: historyTs, historyLimit: historyLimit});
        this.loadMessages(historyTs, historyLimit, 'back');
    },

    loadMessages(historyTs, historyLimit, direction, callback) {
        var self = this;
        Meteor.call('loadMessages', {
            historyTs: historyTs,
            historyLimit: historyLimit,
            direction: direction,
        }, function (err, messages) {
            if (err) {
                alert("Error loading messages: " + err.reason);
            } else {
                ClientMessages._collection.remove({});
                _.each(messages, function (message) {
                    ClientMessages.insert(message);
                });
                self.setState({messages: ClientMessages.find({}, {sort: {createdAt: 1}}).fetch()});
                if(callback) {
                    callback();
                }
            }
        });
    },

    onMessageAdded:function(content) {
        let message = this.insertClientMessage(content);
        Meteor.call('saveMessage', message);
        FlowRouter.go('conversationPageLatest');
        this.setState({messages: ClientMessages.find({}, {sort: {createdAt: 1}}).fetch()});
        this.refs.messageList.scrollBottom();
    },

    insertClientMessage(content) {
        var message = {
            createdBy: 'pdrummond',
            createdAt: new Date().getTime(),
            content: content
        };
        var messageId = ClientMessages.insert(message);
        return _.extend(message, {_id: messageId});
    },


})
