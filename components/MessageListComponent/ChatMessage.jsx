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
                <img style={this.styles.profileImage} src={this.data.userProfileImage} title={'Message ' + this.props.message.seq}/>
                <div style={{paddingLeft:'50px'}}>
                    <div><b>{this.props.message.createdByName}</b>
                        <span className="message-created-at"> {moment(this.props.message.createdAt).fromNow()} </span>
                        {this.renderEditedLabel()}
                        {this.renderMessageDropdown()}
                    </div>
                    <div className="message-content markdown-content"
                         style={this.getMessageContentStyle()}
                         dangerouslySetInnerHTML={ this.getHtmlContent( this.props.message.content ) } />

                </div>
            </li>
        );
    },

    renderEditedLabel() {
      if(this.props.message.isEdited) {
          return <span className="label label-info">edited</span>;
      };
    },

    renderMessageDropdown() {
        return (
            <span className="dropdown">
                <button className="btn btn-xs btn-default dropdown-toggle" style={{color:'gray', backgroundColor:'none', border:'none'}} type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    <span className="caret"></span>
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                    <li><a onClick={this.onEditClicked} href="#">Edit Message</a></li>
                    <li role="separator" className="divider"></li>
                    <li><a onClick={this.onDeleteClicked} href="#">Delete Message</a></li>
                </ul>
            </span>
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
    },

    onEditClicked() {
        var self = this;
        bootbox.dialog({
            message: '<textarea id="edit-chat-message-textarea" rows=10 style="width:100%;border:1px solid lightgray" type="text" name="content">' + this.props.message.content + '</textarea>',
            title: "Edit Message",
            buttons: {
                main: {
                    label: "Save",
                    className: "btn-primary",
                    callback: function (result) {
                        var content = $('#edit-chat-message-textarea').val();
                        if(content != null) {
                            content = content.trim();
                            Meteor.call('editMessage', self.props.message._id, content, (err, content) => {
                                if(err) {
                                    toastr.error("Error deleting message: " + err.reason);
                                } else {
                                    //I know this is bad-form, but it's an exception because messages are special in that
                                    //there is the ServerMessage/ClientMessage split.  So updating the server message isn't
                                    //enough - we have to update the client message separately.
                                    self.props.message.content = content;
                                    self.props.message.isDeleted = false; //message may have been previously deleted
                                    self.props.message.isEdited = true;
                                    self.forceUpdate();
                                }
                            });
                        }
                    }
                },
                cancel: {
                    label: 'Cancel',
                    className: 'btn-default'
                }
            }
        });
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
    },

    getMessageContentStyle() {
        var style = {marginTop: '0px'};
        if(this.props.message.isDeleted) {
            style.color = 'red';
        }
        return style;
    }
});