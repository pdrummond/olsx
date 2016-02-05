/*
    This component is currently used to ensure the messages are loaded
    when the page changes through componentDidUpdate().
 */
ConversationPage = React.createClass({

    render() {
        return (
            <div className="container">
                <header>
                    <h2>Conversation One</h2>
                </header>
                <MessageListContainer
                    ref="messageListContainer"
                />
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