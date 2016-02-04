ConversationPage = React.createClass({
    render() {
        return (
            <div className="container">
                <header>
                    <h2>Conversation One</h2>
                </header>
                <MessageListContainer/>
            </div>
        );
    },

    boom() {
        console.log("WHOOOA");
    }
});