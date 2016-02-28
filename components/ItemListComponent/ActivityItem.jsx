ActivityItem = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        return {
            userProfileImage: Meteor.users.findOne(this.props.activityItem.createdBy).profileImage
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
            <li className="activity-item" onClick={this.onClick}>
                <span style={{fontSize:'12px',color:'#575757', fontWeight:'bold',fontStyle:'italic'}}>
                      <span className="markdown-content" dangerouslySetInnerHTML={ this.getHtmlContent(this.props.activityItem.content) } />
                </span>
                <div style={{fontSize:'10px',color:'gray', fontStyle:'italic'}}>
                    {moment(this.props.activityItem.createdAt).fromNow()}
                    <button type="button" className="btn btn-link btn-xs" onClick={this.onJumpClicked}><i className="fa fa-mail-reply"></i></button>
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
            projectId: this.props.activityItem.projectId,
            startMessageSeq: this.props.activityItem.messageSeq
        }, {
            scrollTop: true,
            selectStartMessage: true
        });
    },
});
