/*
    This component is currently used to ensure the messages are loaded
    when the page changes through componentDidUpdate().
 */
ConversationPage = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        return {
           conversationId: FlowRouter.getParam('conversationId')
        };
    },

    render() {
        if(this.data.conversationId) {
            return (
                <div className="container">
                    <ConversationListContainer/>
                    <header>
                        <h2>{this.data.conversationId}</h2>
                    </header>
                    <MessageListContainer ref="messageListContainer"/>
                </div>
            );
        } else {
            return (
                <div className="container">
                    <ConversationListContainer/>
                    <div className="empty-conversation-list">
                        <p><b>Welcome to OpenLoops</b></p>
                        <div><i className="fa fa-smile-o" style={{'fontSize':'20em'}}></i></div>
                        <p>Create or select a conversation to get started</p>
                    </div>
                </div>
            );
        }
    },

    componentDidMount: function() {
        console.trace("ConversationPage.componentDidMount");
    },

    componentDidUpdate: function() {
        console.trace("ConversationPage.componentDidUpdate");
        this.refs.messageListContainer.loadMessages();
    },
});