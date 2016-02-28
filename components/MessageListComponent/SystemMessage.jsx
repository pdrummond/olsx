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
                            {this.renderMessageDropdown()}
                        </div>
                        <div className="message-content markdown-content"
                             style={this.getMessageContentStyle()}
                             dangerouslySetInnerHTML={ this.getHtmlContent( content ) } />
                    </div>
                </li>
            );
        }
    },

    renderMessageDropdown() {
        return (
            <span className="dropdown">
                <button className="btn btn-xs btn-default dropdown-toggle" style={{color:'gray', backgroundColor:'none', border:'none'}} type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    <span className="caret"></span>
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                    <li><a onClick={this.onAddRefClicked} href="#">Add Item Reference</a></li>
                    <li role="separator" className="divider"></li>
                    <li><a onClick={this.onDeleteClicked} href="#">Delete Message</a></li>
                </ul>
            </span>
        );
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
    },

    onAddRefClicked(e) {
      e.preventDefault();
      var self = this;
      bootbox.prompt({title: "Enter item seq (i.e: 'For #OLS-42 enter 42'):", callback: function(seq) {
        if (seq !== null) {
          seq = parseInt(seq.trim());
          Meteor.call('addRefToMessage', self.props.message.projectId, self.props.message._id, seq, (err, content) => {
            if(err) {
              toastr.error("Error adding ref to message: " + err.reason);
            } else {
              //I know this is bad-form, but it's an exception because messages are special in that
              //there is the ServerMessage/ClientMessage split.  So updating the server message isn't
              //enough - we have to update the client message separately.
              self.props.message.content = content;
              self.props.message.isDeleted = false; //message may have been previously deleted
              self.props.message.isEdited = false;
              self.forceUpdate();
            }
          });
        }
      }});
    },

    onDeleteClicked() {
        var self = this;
        bootbox.confirm("Are you sure you want to delete this message?", function(result) {
            if(result !== null) {
                Meteor.call('deleteMessage', self.props.message._id, (err, deletedMessageContent) => {
                    if(err) {
                        toastr.error("Error deleting message: " + err.reason);
                    } else {
                        //I know this is bad-form, but it's an exception because messages are special in that
                        //there is the ServerMessage/ClientMessage split.  So updating the server message isn't
                        //enough - we have to update the client message separately.
                        self.props.message.content = deletedMessageContent;
                        self.props.message.isDeleted = true;
                        self.forceUpdate();
                    }
                });
            }
        });
    }
});
