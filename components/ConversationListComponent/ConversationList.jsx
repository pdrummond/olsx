
ConversationList = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        var data = {};
        var handle = Meteor.subscribe('conversations');
        if(handle.ready) {
            data.conversations = Conversations.find({}).fetch();
        }
        return data;
    },

    renderConversations() {
        if(this.data.conversations) {
            return this.data.conversations.map((conv) => {
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