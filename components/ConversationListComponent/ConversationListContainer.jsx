ConversationListContainer = React.createClass({
    propTypes: {
        currentConversationId: React.PropTypes.string,
        conversationList: React.PropTypes.array,
        incomingMessages: React.PropTypes.array,

        onConversationClicked: React.PropTypes.func
    },

    render() {
        return (
            <div className="conversation-list-container">
                <form className="new-conversation" onSubmit={this.handleSubmit} >
                    <input className="conversation-input"
                           type="text"
                           ref="textInput"
                           placeholder="Type here to start a conversation" />
                </form>
                <ConversationList
                    currentConversationId={this.props.currentConversationId}
                    conversationList={this.props.conversationList}
                    onConversationClicked={this.props.onConversationClicked}
                    incomingMessages={this.props.incomingMessages} />
            </div>
        )
    },

    handleSubmit(event) {
        event.preventDefault();
        var subject = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

        Conversations.methods.addConversation.call({subject}, (err) => {
            if(err) {
                toastr.error('Oops! Something went wrong creating conversation - please try again.');
                console.error('Error creating conversation: ' + err);
            }
        });
        ReactDOM.findDOMNode(this.refs.textInput).value = "";
    }
});