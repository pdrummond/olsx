
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
                    <a className={this.props.showBackwardLink ? '':'hide'} href='' onClick={this.props.onLoadOlderLinkClicked}><i className="message-list-page-icon fa-2x fa fa-arrow-circle-o-up"></i></a>
                    {this.renderMessages()}
                    <a className={this.props.showForwardLink ? '':'hide'} href='' onClick={this.props.onLoadNewerLinkClicked}><i className="message-list-page-icon fa-2x fa fa-arrow-circle-o-down"></i></a>
                </ul>
                <div id="incoming-messages-toast"
                     onClick={this.props.onIncomingMessageToastClicked}
                     className={this.props.incomingMessageCount == 0? 'hidden':''}><i className="fa fa-caret-down"></i> {this.props.incomingMessageCount} New Messages</div>
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

    isScrollBottom() {
        let node = ReactDOM.findDOMNode(this.refs.messageList);
        let atBottom = node.scrollHeight == node.scrollTop + node.clientHeight;
        return atBottom;
    }

});