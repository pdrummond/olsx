
ConversationList = React.createClass({
    renderConversations() {
        if(this.props.conversationList) {
            return this.props.conversationList.map((conv) => {
                return <Conversation onClick={this.props.onConversationClicked} key={conv._id} conv={conv}/>;
            });
        } else {
            return <p>Loading...</p>;
        }
    },

    render() {
       return (
           <ul className="conversation-list">
               {this.renderConversations()}
           </ul>
       )
    }
});