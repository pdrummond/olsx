MessageListContainer = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        return {
            messages: ClientMessages.find({}, {sort: {createdAt: 1}}).fetch(),
            historyFrom: parseInt(FlowRouter.getParam('historyFrom')),
            historyLimit: parseInt(FlowRouter.getParam('historyLimit'))
        }
    },

    render() {
        return (
            <MessageList
                ref="messageList"
                messages = {this.data.messages}
                onMessageAdded = {this.onMessageAdded}
            />
        )
    },

    componentDidMount: function() {
      this.loadInitialMessages();
    },

    loadInitialMessages() {
        ClientMessages._collection.remove({});
        Meteor.call('loadMessages', {
            historyFrom: this.data.historyFrom,
            historyLimit: this.data.historyLimit
        }, function(err, messages) {
            if (err) {
                alert("Error loading messages: " + err.reason);
            } else {
                _.each(messages, function (message) {
                    ClientMessages.insert(message);
                });
            }
        });
    },

    onMessageAdded:function(content) {
        let message = this.insertClientMessage(content);
        Meteor.call('saveMessage', message);
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
