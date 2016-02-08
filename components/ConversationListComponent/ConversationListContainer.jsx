ConversationListContainer = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        var data = {};
        var handle = Meteor.subscribe('conversations');
        if(handle.ready) {
            data.conversationList = Conversations.find({}).fetch();
        }
        return data;
    },

    render() {
        return (
            <div className="conversation-list-container">
                <form className="new-task" onSubmit={this.handleSubmit} >
                    <input className="conversation-input"
                           type="text"
                           ref="textInput"
                           placeholder="Type here to start a conversation" />
                </form>
                <ConversationList
                    conversationList={this.data.conversationList} onConversationClicked={this.onConversationClicked} />
            </div>
        )
    },

    onConversationClicked(conv) {
      FlowRouter.go('conversationPageLatest', {conversationId: conv._id, historyMode: 'latest'});
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