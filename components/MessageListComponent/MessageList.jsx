
MessageList = React.createClass({

    renderMessages() {
        if(this.props.messages == null || this.props.messages.length == 0) {
            return (
                <div>
                    <p style={{padding:'30px'}}><i>There are no Messages in this conversation</i></p>
                </div>
            );
        } else {
            return this.props.messages.map((message) => {
                if(message.messageType && message.messageType == Ols.MESSAGE_TYPE_CUSTOM) {
                    var componentFn = Ols.Command.getComponent(message.customMessageType);
                    var component = componentFn(message);
                    return component;
                } else {
                    var message = <Message key={message._id} message={message}/>;
                    return message;
                }
            });
        }
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
                     className={this.props.incomingMessageCount == 0? 'hidden':''}>
                    <i className="fa fa-caret-down"></i> {this.props.incomingMessageCount} {this.props.incomingMessageCount == 1 ? 'New Message' : 'New Messages'}</div>
                <MessageBox onMessageAdded={this.props.onMessageAdded} />
            </div>
        )
    },

    scrollBottom(callback) {
        var self = this;
        setTimeout(function() {
            let node = ReactDOM.findDOMNode(self.refs.messageList);
            node.scrollTop = node.scrollHeight;
            if(callback) {
                callback();
            }
        }, 20);
    },

    isScrollBottom() {
        let node = ReactDOM.findDOMNode(this.refs.messageList);
        let atBottom = node.scrollHeight == node.scrollTop + node.clientHeight;
        console.log('isScrollBottom: ' + atBottom);
        return atBottom;

    }

});