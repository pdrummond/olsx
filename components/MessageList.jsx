
MessageList = React.createClass({

    renderMessages() {
      return this.props.messages.map((message) => {
         return <Message key={message._id} message={message} />;
      });
    },


    render() {
        return (
            <div className="message-list-wrapper">
                <ul className="message-list" ref="messageList">
                    <a href='' onClick={this.props.onLoadOlderLinkClicked}>Load older messages</a>
                    {this.renderMessages()}
                    <a href='' onClick={this.props.onLoadNewerLinkClicked}>Load newer messages</a>
                </ul>
                <MessageBox onMessageAdded={this.props.onMessageAdded} />
            </div>
        )
    },

    scrollBottom() {
        var self = this;
        setTimeout(function() {
            let node = ReactDOM.findDOMNode(self.refs.messageList);
            node.scrollTop = node.scrollHeight;
        }, 20);
    },

});