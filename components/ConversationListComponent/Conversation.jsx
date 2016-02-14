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
                className={this.getClassName()}>
                <i style={{float:'left', color:'#7089A9'}} className="fa fa-2x fa-comments-o"></i>
                <div style={{paddingLeft:'40px', lineHeight:'1.2'}}>
                    <span className="conversation-subject">{this.props.conv.subject}</span>
                    <span className={this.props.numNewMessages == 0 ?"hide conversation-new-messages-badge":"conversation-new-messages-badge"}>
                        {this.props.numNewMessages}
                    </span>
                    <div style={{fontSize:'12px', color:'gray', position:'relative'}}>
                        Created by {this.props.conv.createdByName} {moment(this.props.conv.createdAt).fromNow()}
                    </div>
                </div>

            </li>
        )
    },

    getClassName() {
        var className = 'conversation';
        if(this.props.isActive) {
            className += ' active';
        }
        if(this.props.isSeen) {
            className += ' seen';
        }
        return className;
    },

    onClick: function() {
        this.props.onClick(this.props.conv);
    }
});