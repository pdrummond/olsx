ConversationList = React.createClass({

    propTypes: {
        currentConversationId: React.PropTypes.string,
        conversationList: React.PropTypes.array,
        incomingMessages: React.PropTypes.array,

        onConversationClicked: React.PropTypes.func
    },

    renderConversations() {
        return this.props.conversationList.map((conv) => {
            return (
                <Conversation
                    numNewMessages={this.numNewMessages(conv._id)}
                    isSeen={this.isSeen(conv)}
                    isActive={conv._id == this.props.currentConversationId}
                    onClick={this.props.onConversationClicked} key={conv._id} conv={conv}/>
            );
        });
    },

    numNewMessages: function(conversationId) {
        var count = 0;
        _.each(this.props.incomingMessages, function(msg) {
           if(msg.conversationId == conversationId) {
               count++;
           }
        });
        return count;
    },

    isSeen: function(conv) {
        return conv.seenList && conv.seenList.indexOf(Meteor.userId()) != -1;
    },

    render() {
       return (
           <ul className="conversation-list">
               {this.renderConversations()}
           </ul>
       )
    }
});