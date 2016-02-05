ConversationPage = React.createClass({
    render() {
        return (
            <div className="container">
                <header>
                    <h2>Conversation One</h2>
                </header>
                <MessageListContainer ref="messageListContainer"/>
            </div>
        );
    },

    componentDidMount: function() {
        console.trace("ConversationPage.componentDidMount");
    },

    componentDidUpdate: function() {
        console.trace("ConversationPage.componentDidUpdate");
        this.refs.messageListContainer.loadMessages();
    },
});