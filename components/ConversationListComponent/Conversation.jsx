Conversation = React.createClass({
    render() {
        return (
            <li onClick={this.onClick} className="conversation">{this.props.conv.title}</li>
        )
    },

    onClick: function() {
        this.props.onClick(this.props.conv);
    }
});