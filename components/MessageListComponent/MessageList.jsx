MessageList = React.createClass({

    renderMessages() {
        console.log('> renderMessage');
        if(this.props.messages == null || this.props.messages.length == 0) {
            return (
                <div>
                    <p style={{padding:'30px', fontSize: '20px', color: 'gray', fontWeight: 100}}>
                        {this.getRandomEmptyMessage()}
                    </p>
                </div>
            );
        } else {
            var key = 0;
            return this.props.messages.map((message) => {
                key++;
                switch(message.messageType) {
                    case Ols.MESSAGE_TYPE_CUSTOM:
                    var componentFn = Ols.Command.getComponent(message.customMessageType);
                    var component = componentFn(message);
                    component.key = "{key}";
                    return component;
                    case Ols.MESSAGE_TYPE_SYSTEM:
                    var message = <SystemMessage key={key} message={message}/>;
                    return message;
                    case Ols.MESSAGE_TYPE_CHAT:
                    var message = <ChatMessage key={key} message={message}/>;
                    return message;
                    default: {
                        console.error("Unrecognised message type: " + message.messageType);
                        break;
                    }
                }
            });
        }

        console.log('< renderMessage');
    },

    render() {
        return (
            <div className="message-list-wrapper">
                <ul className="message-list" ref="messageList">
                    <a className={this.props.showBackwardLink ? '':'hide'} href='' onClick={this.props.onLoadOlderLinkClicked}><i className="message-list-page-icon fa-2x fa fa-arrow-circle-o-up"></i></a>
                    {this.renderMessages()}
                    <a className={this.props.showForwardLink ? '':'hide'} href='' onClick={this.props.onLoadNewerLinkClicked}><i className="message-list-page-icon fa-2x fa fa-arrow-circle-o-down"></i></a>
                </ul>
                <MessageBox
                    onUserIsTyping={this.props.onUserIsTyping}
                    onMessageAdded={this.props.onMessageAdded} />
                <UserIsTypingAlert conversationId={this.props.conversationId}/>
                <div id="incoming-messages-toast"
                     onClick={this.props.onIncomingMessageToastClicked}
                     className={this.props.incomingMessageCount == 0? 'hidden':''}>
                    <i className="fa fa-caret-down"></i> {this.props.incomingMessageCount} {this.props.incomingMessageCount == 1 ? 'New Message' : 'New Messages'}</div>
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

    },

    getRandomEmptyMessage() {
        var msgs = [
            "So this conversation is empty right now, but not for long!",
            "An empty conversation this is.  Will you be the first to get the discussion moving? :-)",
            "Who will be the first to add a message to this wonderful new conversation?",
            "Everyone knows that communication makes a team more productive, so let's get this conversation started!",
            "Today, we are going to be super productive and this conversation is where it all begins",
            "Let's replace this message with something of more substance shall we? Who's going to be first?"
        ];
        return msgs[this.getRandomInt(msgs.length-1)];
    },

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     */
    getRandomInt(max) {
        var min = 0;
        var num = Math.floor(Math.random() * (max - min + 1)) + min;
        console.log("getRandomInt(" + max + ": " + num);
        return num;
    }

});