ConversationListContainer = React.createClass({
    render() {
        return (
            <div className="conversation-list-container">
                <form className="new-task" onSubmit={this.handleSubmit} >
                    <input className="conversation-input"
                           type="text"
                           ref="textInput"
                           placeholder="Type here to start a conversation" />
                </form>
                <ConversationList onConversationClicked={this.onConversationClicked} />
            </div>
        )
    },

    onConversationClicked(conv) {
      FlowRouter.go('conversationPageLatest', {conversationId: conv._id, historyMode: 'latest'});
    },

    handleSubmit(event) {
        event.preventDefault();
        var title = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

        Meteor.call('addConversation', title, function(err) {
            if(err) {
                toastr.error('Something went wrong creating conversation', err.reason);
            }
        });

        ReactDOM.findDOMNode(this.refs.textInput).value = "";
    }
});