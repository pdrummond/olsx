SystemMessage = React.createClass({
    mixins: [ReactMeteorData],

    styles: {
        profileImage: {
            float: 'left',
            width: '30px',
            borderRadius: '20px',
            position:'relative',
            top:'5px'

        }
    },

    getMeteorData() {
        var data = {};
        data.isDetailMode = FlowRouter.getQueryParam('rightView') == 'ITEM_DETAIL';
        data.selectStartMessage = FlowRouter.getQueryParam('selectStartMessage') == "true";
        data.startMessageSeq = parseInt(FlowRouter.getParam('startMessageSeq'));
        if(this.props.message.messageType == Ols.MESSAGE_TYPE_ACTIVITY) {
            data.userProfileImage = Meteor.users.findOne(this.props.message.createdBy).profileImage;
        }
        return data;
    },

    render() {
        //This is to support the old message style - won't be used going forward so if the data is reset
        //before release we can get rid of this.
        if(this.props.message.messageType == Ols.MESSAGE_TYPE_SYSTEM) {
            return (
                <li className={this.getClassName()} onClick={this.onClick}>
                <span className="message-content">
                    <i className="fa fa-dot-circle-o"></i> {this.props.message.content}
                </span>
                    <span className="message-created-at"> {moment(this.props.message.createdAt).fromNow()}</span>
                </li>
            );
        } else {
            var content;
            if(this.data.isDetailMode) {
                content = this.props.message.data ? this.props.message.data.shortDescription : this.props.message.content;
            } else {
                content = this.props.message.content;
            }
            return (
                <li className={this.getClassName()} onClick={this.onClick}>
                    <img style={this.styles.profileImage} src={this.data.userProfileImage} title={'Message ' + this.props.message.seq}/>
                    <div style={{paddingLeft:'50px'}}>
                        <div><b>{this.props.message.createdByName}</b>
                            <span className="message-created-at"> {moment(this.props.message.createdAt).fromNow()}</span>
                        </div>
                        <div className="message-content markdown-content"
                             style={this.getMessageContentStyle()}
                             dangerouslySetInnerHTML={ this.getHtmlContent( content ) } />

                    </div>
                </li>
            );
        }
    },

    getMessageContentStyle() {
        var style = {marginTop: '0px', fontStyle: 'italic'};
        if(this.props.message.isDeleted) {
            style.color = 'red';
        }
        return style;
    },

    getHtmlContent: function(content) {
        if ( content ) {
            return { __html: parseMarkdown(content) };
        }
    },

    getClassName() {
        var className = this.props.message.isError?'message-item error':'message-item success'
        if(this.data.selectStartMessage == true && this.data.startMessageSeq == this.props.message.seq) {
            className += ' active';
        }
        return className;
    },

    onClick: function() {
        FlowRouter.setQueryParams({selectStartMessage: null});
    }
});
