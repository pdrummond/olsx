
ConversationList = React.createClass({
    renderConversations() {
        return this.props.conversationList.map((conv) => {
            return <Conversation
                isActive={conv._id == this.props.currentConversationId}
                onClick={this.props.onConversationClicked} key={conv._id} conv={conv}/>;
        });
    },

    render() {
       return (
           <ul className="conversation-list">
               {this.renderConversations()}
           </ul>
       )
    }
});