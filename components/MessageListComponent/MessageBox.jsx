
MessageBox = React.createClass({

    getInitialState: function() {
        return {content: ''};
    },

    render() {
        return (
            <div className="message-box">
                <form>
                    <textarea onChange={this.onChange}
                              onKeyDown={this.onKeyDown}
                              type="text"
                              name="message"
                              placeholder="Type here to add message..."
                              value={this.state.content}
                              autofocus="autofocus"
                    />
                </form>
            </div>
        )
    },

    onChange: function(event, value) {
        // ENTER_KEY_CODE handled by onKeyDown
        if (event.target.value !== "\n") {
            this.setState({content: event.target.value});
            this.props.onUserIsTyping();
        }
    },

    onKeyDown: function(event) {
        // Trap the ENTER_KEY_CODE to send the message
        if (event.keyCode === Ols.Keys.ENTER_KEY_CODE && event.shiftKey == false) {
            var content = this.state.content.trim();
            if (content) {
                this.props.onMessageAdded(content);
            }
            this.setState({content: ''});
        }
    },

})