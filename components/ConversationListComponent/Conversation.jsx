Conversation = React.createClass({
    render() {
        return (
            <li onClick={this.onClick} className="conversation">{this.props.conv.subject}</li>
        )
    },

    onClick: function() {
        this.props.onClick(this.props.conv);
    }
});