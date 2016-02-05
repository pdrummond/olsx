
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
                showForwardLink = {this.state.showForwardLink}
                showBackwardLink = {this.state.showBackwardLink}
                onMessageAdded = {this.onMessageAdded}
                onLoadOlderLinkClicked = {this.onLoadOlderLinkClicked}
                onLoadNewerLinkClicked = {this.onLoadNewerLinkClicked}
            />
        )
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
        this.refs.messageList.scrollBottom();
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
        var self = this;
        Meteor.call('loadMessages', {
            historyTs,
            historyLimit,
            historyMode
        }, function (err, messages) {
            if (err) {
                alert("Error loading messages: " + err.reason);
            } else {
                ClientMessages._collection.remove({});
                _.each(messages, function (message) {
                    ClientMessages.insert(message);
                });
                var clientMessages = ClientMessages.find({}, {sort: {createdAt: 1}}).fetch();
                var showForwardLink = true;
                var showBackwardLink = true;
                if(clientMessages.length < historyLimit) {
                    if(historyMode == 'forward') {
                        showForwardLink = false;
                    } else if(historyMode == 'back') {
                        showBackwardLink = false;
                    }
                }

                self.setState({messages: clientMessages, showBackwardLink, showForwardLink});
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
