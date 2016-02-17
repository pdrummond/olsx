ChatMessage = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        return {
            selectStartMessage: FlowRouter.getQueryParam('selectStartMessage') == "true",
            startMessageSeq: parseInt(FlowRouter.getParam('startMessageSeq')),
            userProfileImage: Meteor.users.findOne(this.props.message.createdBy).profileImage
        };
    },

    styles: {
        profileImage: {
            float: 'left',
            width: '30px',
            borderRadius: '20px',
            position:'relative',
            top:'5px'

        }
    },

    render() {
        return (
            <li className={this.getClassName()} onClick={this.onClick}>
                <img style={this.styles.profileImage} src={this.data.userProfileImage}/>
                <div style={{paddingLeft:'50px'}}>
                    <div><b>{this.props.message.createdByName}</b>
                        <span
                            className="message-created-at"> {moment(this.props.message.createdAt).fromNow()}</span>

                    </div>
                    <div className="message-content markdown-content" style={{marginTop: '0px'}} dangerouslySetInnerHTML={ this.getHtmlContent( this.props.message.content ) } />

                </div>
            </li>
        );
    },

    getClassName() {
        if(this.data.selectStartMessage == true && this.data.startMessageSeq == this.props.message.seq) {
            return 'message-item active';
        } else {
            return 'message-item';
        }
    },

    getHtmlContent: function(content) {
        if ( content ) {
            return { __html: parseMarkdown(content) };
        }
    },

    onClick: function() {
        FlowRouter.setQueryParams({selectStartMessage: null});
    }
});