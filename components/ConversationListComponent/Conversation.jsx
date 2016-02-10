Conversation = React.createClass({
    propTypes: {
        numNewMessages: React.PropTypes.number,
        isActive: React.PropTypes.bool,

        onClick: React.PropTypes.func
    },

    render() {
        return (
            <li
                onClick={this.onClick}
                className={this.props.isActive?'conversation active':'conversation'}>
                <i style={{float:'left', color:'gray'}} className="fa fa-2x fa-comments-o"></i>
                <div style={{paddingLeft:'40px'}}>
                    <span className="conversation-subject">{this.props.conv.subject}</span>
                    <span className={this.props.numNewMessages == 0 ?"hide conversation-new-messages-badge":"conversation-new-messages-badge"}>
                        {this.props.numNewMessages}
                    </span>
                </div>

            </li>
        )
    },

    onClick: function() {
        this.props.onClick(this.props.conv);
    }
});