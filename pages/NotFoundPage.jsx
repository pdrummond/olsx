NotFoundPage = React.createClass({
    render() {
        return (
            <div className="container">
                <ConversationListContainer />
                <div className="empty-conversation-list">
                    <p><b>Oh Four Oh Four - Nothing to see here!</b></p>
                    <div><i className="fa fa-frown-o" style={{'fontSize':'20em'}}></i></div>
                    <p>Don't worry, just click on a conversation to your left to get back to normality <i className="fa fa-smile-o"></i></p>
                </div>
            </div>
            );
    },

});