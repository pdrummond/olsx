MessageList = React.createClass({

    renderMessages() {
        if(this.props.messages == null || this.props.messages.length == 0) {
            return (
                <div>
                    <p style={{padding:'30px', fontSize: '20px', color: 'gray', fontWeight: 100}}>
                        {this.getRandomEmptyMessage()}
                    </p>
                </div>
            );
        } else {
            return this.props.messages.map((message) => {
                    switch (message.messageType) {
                        case Ols.MESSAGE_TYPE_LOOPBOT:
                            return <LoopBotMessage key={message._id} message={message}/>;
                            break;
                        case Ols.MESSAGE_TYPE_CUSTOM:
                            var componentFn = Ols.Command.getComponent(message.customMessageType);
                            var component = componentFn(message);
                            return component;
                            break;
                        case Ols.MESSAGE_TYPE_ACTIVITY:
                        case Ols.MESSAGE_TYPE_SYSTEM:
                            return <SystemMessage key={message._id} message={message}/>;
                            break;
                        case Ols.MESSAGE_TYPE_CHAT:
                            return <ChatMessage key={message._id} message={message}/>;
                            break;
                        default:
                        {
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
                <UserIsTypingAlert projectId={this.props.projectId}/>
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

    scrollTop() {
        var self = this;
        setTimeout(function() {
            let node = ReactDOM.findDOMNode(self.refs.messageList);
            node.scrollTop = 0;
        }, 20);
    },

    isScrollBottom() {
        let node = ReactDOM.findDOMNode(this.refs.messageList);
        let atBottom = node.scrollHeight == node.scrollTop + node.clientHeight;
        console.log('isScrollBottom: ' + atBottom);
        return atBottom;

    },

    getRandomEmptyMessage() {
        /*
        var msgs = [
            "So this project is empty right now, but not for long!",
            "An empty project this is.  Will you be the first to get things moving? :-)",
            "Who will be the first to add a message to this wonderful new project?",
            "Today, we are going to be super productive and creating this project was the first step",
        ];
        return msgs[this.getRandomInt(msgs.length-1)];*/
        return "Nothing to show here - be the first to add a message.";
    },

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     */
    getRandomInt(max) {
        var min = 0;
        var num = Math.floor(Math.random() * (max - min + 1)) + min;
        return num;
    }

});
