Ref = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        return {
            userProfileImage: Meteor.users.findOne(this.props.refItem.createdBy).profileImage
        };
    },

    styles: {
        profileImage: {
            float: 'left',
            width: '20px',
            borderRadius: '10px',
            position:'relative',
            top:'5px'

        }
    },

    render() {
        return (
            <li className='ref-item'>
                <img style={this.styles.profileImage} src={this.data.userProfileImage}/>
                <div style={{paddingLeft:'30px', fontSize: '12px'}}>
                    <div><b>{this.props.refItem.createdByName}</b>
                        <span
                            className="message-created-at"> {moment(this.props.refItem.createdAt).fromNow()}</span>
                        <button type="button" className="btn btn-link btn-xs" onClick={this.onJumpClicked}><i className="fa fa-mail-reply"></i></button>

                    </div>
                    <div className="message-content markdown-content" style={{marginTop: '0px'}} dangerouslySetInnerHTML={ this.getHtmlContent( this.props.refItem.messageContent ) } />
                </div>
            </li>
        );
    },

    getHtmlContent: function(content) {
        if ( content ) {
            return { __html: parseMarkdown(content) };
        }
    },

    onJumpClicked: function() {
        FlowRouter.go('projectPageStartSeq', {
            projectId: this.props.refItem.projectId,
            startMessageSeq: this.props.refItem.messageSeq
        }, {
            scrollTop: true,
            selectStartMessage: true
        });
    },
});