
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
                    {this.renderMessages()}
                </ul>
                <MessageBox onMessageAdded={this.props.onMessageAdded} />
            </div>
        )
    },

    scrollBottom() {
        let node = ReactDOM.findDOMNode(this.refs.messageList);
        node.scrollTop = node.scrollHeight;
    },

});