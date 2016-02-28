Item = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        item: React.PropTypes.object.isRequired,
        milestoneList: React.PropTypes.array.isRequired,
        detailMode: React.PropTypes.bool
    },

    getDefaultProps() {
        return {
            detailMode: false
        }
    },

    getInitialState() {
        return {
            isSelected: false,
            showRefList: false,
            showActivityList: false,
            showDescription: this.props.detailMode
        }
    },

    getMeteorData() {
        var data = {};
        data.refList = [];
        var activityHandle = Meteor.subscribe('itemActivity', this.props.item._id);
        if(activityHandle.ready()) {
            data.refList = Refs.find({
                projectId: this.props.item.projectId,
                itemId: this.props.item._id
            }, {
                sort: {createdAt: 1}
            }).fetch();
            data.activityList = Activity.find({itemId:this.props.item._id}, {sort: {createdAt: -1}}).fetch();
            console.log("Item.getMeteorData() refList = " + JSON.stringify(data.refList));

            if(this.props.item.assignee) {
                data.assigneeProfileImage = Meteor.users.findOne({username: this.props.item.assignee}).profileImage;
            }
        }
        return data;
    },

    styles: {
        itemIcon: {
            float: 'left',
            width: '35px',
            position: 'relative',
            top: '5px'
        },
        assigneeProfileImage: {
            width: '20px',
            borderRadius: '20px'
            /*position:'relative',
             top:'5px'*/

        }
    },

    render() {
        return (
            <li className={this.state.isSelected?'item active':'item'}>
                <div className="item-wrapper">
                    {this.renderTypeDropdown()}
                    <div style={{paddingLeft: '0px'}}>
                        <div onClick={this.onTitleClicked}
                             className="item-title"
                             style={this.getTitleStyle()}>
                            {this.props.item.description}
                        </div>
                        <div style={{fontSize:'12px',color:'gray', paddingLeft:'35px', paddingTop:'5px', paddingBottom:'5px'}}>
                            {this.renderKey()} Created by {this.props.item.createdByName} {moment(this.props.item.createdAt).fromNow()}
                        </div>
                    </div>
                    <div className="labels" style={{paddingLeft:'35px',lineHeight: '1.8'}}>
                        {this.renderStatusDropdown()}
                        {/*<span className="label label-default"><i className="fa fa-flag-checkered"></i> Milestone 1</span>
                         <span className="label label-primary"><i className="fa fa-flag"></i> Sprint 44</span>*/}
                        {this.renderMilestoneDropdown()}
                        {this.renderAssigneeButton()}
                        {this.renderPriorityBadge()}
                    </div>
                    {this.renderSelectedLinks()}
                </div>
                {this.renderDescription()}
                {this.renderRefList()}
                {this.renderActivityList()}
            </li>
        )
    },

    getTitleStyle() {
        var style = {fontSize: '14px', fontWeight: 'bold', color:'gray'};
        if(Ols.Status.isDone(this.props.item.status)) {
            style.textDecoration = 'line-through';
        }
        return style;
    },

    renderTypeDropdown() {
        return(
            <span className="dropdown pull-left" style={{width:'35px'}}>
                <button className="item-type-dropdown-button btn btn-xs btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    <i style={this.styles.itemIcon} className={this.getItemTypeClassName('fa fa-2x')}></i>
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                    <li><a onClick={this.onTaskTypeClicked} href="#"><i className="fa fa-exclamation-circle"></i> Task</a></li>
                    <li><a onClick={this.onBugTypeClicked} href="#"><i className="fa fa-bug"></i> Bug</a></li>
                    <li><a onClick={this.onDiscussionTypeClicked} href="#"><i className="fa fa-comments-o"></i> Discussion</a></li>
                    <li><a onClick={this.onQuestionTypeClicked} href="#"><i className="fa fa-question-circle"></i> Question</a></li>
                </ul>
            </span>
        );
    },

    getItemTypeClassName(className) {
        switch(this.props.item.subType) {
            case Ols.Item.ACTION_SUBTYPE_TASK: className += ' fa-exclamation-circle'; break;
            case Ols.Item.ISSUE_SUBTYPE_BUG: className += ' fa-bug'; break;
            case Ols.Item.INFO_SUBTYPE_DISCUSSION: className += ' fa-comments-o'; break;
            case Ols.Item.INFO_SUBTYPE_QUESTION: className += ' fa-question-circle'; break;
        }
        return className;
    },

    renderPriorityBadge() {
        if(this.props.item.priority) {
            return <span onClick={this.onSetPriorityClicked}
                         className='pull-right badge' title="Priority"
                         style={{backgroundColor:'lightgray', cursor:'pointer'}}>{this.props.item.priority}</span>;
        }
    },

    renderStatusDropdown() {
        if(this.props.item.subType == 'question') {
            return this.renderQuestionStatusDropdown();
        } else {
            return this.renderItemStatusDropdown();
        }
    },

    renderAssigneeButton() {
        if(this.props.item.assignee) {
            return (
                <span style={{marginLeft:'5px'}}>
                    <button className="btn btn-xs btn-borderless" onClick={this.onChangeAssigneeClicked}>
                        <img style={this.styles.assigneeProfileImage} src={this.data.assigneeProfileImage} title={'Assigned to ' + this.props.item.assignee}/>
                    </button>
                </span>
            );
        }
    },

    renderItemStatusDropdown() {
        return (
            <div className="btn-group">
                <button type="button" className="btn btn-xs btn-default dropdown-toggle" data-toggle="dropdown" style={{border:'none', marginRight:'5px', backgroundColor:Ols.Status.getStatusColor(this.props.item.status)}}>
                    <span className="label label-borderless"><i className="fa fa-circle"></i> {Ols.Status.getStatusLabel(this.props.item.status)}</span>
                </button>
                <ul className="dropdown-menu">
                    {/*<li><a href="" onClick={this.onStatusNewClicked}> <i className="fa fa-circle" style={{color: Ols.Status.getStatusColor(Ols.Status.NEW)}}></i> New</a></li>*/}
                    <li><a href="" onClick={this.onStatusOpenClicked}> <i className="fa fa-circle" style={{color: Ols.Status.getStatusColor(Ols.Status.OPEN)}}></i> Open</a></li>
                    <li><a href="" onClick={this.onStatusInProgressClicked}> <i className="fa fa-circle" style={{color: Ols.Status.getStatusColor(Ols.Status.IN_PROGRESS)}}></i> In Progress</a></li>
                    <li><a href="" onClick={this.onStatusBlockedClicked}> <i className="fa fa-circle" style={{color: Ols.Status.getStatusColor(Ols.Status.BLOCKED)}}></i> Blocked</a></li>
                    <li><a href="" onClick={this.onStatusInTestClicked}> <i className="fa fa-circle" style={{color: Ols.Status.getStatusColor(Ols.Status.IN_TEST)}}></i> In Test</a></li>
                    <li role="separator" className="divider"></li>
                    <li><a href="" onClick={this.onStatusDoneClicked}> <i className="fa fa-circle" style={{color: Ols.Status.getStatusColor(Ols.Status.DONE)}}></i> Done</a></li>
                    <li><a href="" onClick={this.onStatusRejectedClicked}> <i className="fa fa-circle" style={{color: Ols.Status.getStatusColor(Ols.Status.REJECTED)}}></i> Rejected</a></li>
                    <li><a href="" onClick={this.onStatusDuplicateClicked}> <i className="fa fa-circle" style={{color: Ols.Status.getStatusColor(Ols.Status.DUPLICATE)}}></i> Duplicate</a></li>
                    <li><a href="" onClick={this.onStatusOutOfScopeClicked}> <i className="fa fa-circle" style={{color: Ols.Status.getStatusColor(Ols.Status.OUT_OF_SCOPE)}}></i> Out of Scope</a></li>
                </ul>
            </div>
        );
    },

    renderQuestionStatusDropdown() {
        return (
            <div className="btn-group">
                <button type="button" className="btn btn-xs btn-default dropdown-toggle" data-toggle="dropdown" style={{border:'none', marginRight:'5px', backgroundColor:Ols.QuestionStatus.getStatusColor(this.props.item.status)}}>
                    <span className="label label-borderless"><i className="fa fa-circle"></i> {Ols.QuestionStatus.getStatusLabel(this.props.item.status)}</span>
                </button>
                <ul className="dropdown-menu">
                    <li><a href="" onClick={this.onQuestionStatusUnansweredClicked}> <i className="fa fa-circle" style={{color: Ols.QuestionStatus.getStatusColor(Ols.QuestionStatus.UNANSWERED)}}></i> Unanswered</a></li>
                    <li><a href="" onClick={this.onQuestionStatusBlockedClicked}> <i className="fa fa-circle" style={{color: Ols.QuestionStatus.getStatusColor(Ols.QuestionStatus.BLOCKED)}}></i> Blocked</a></li>
                    <li><a href="" onClick={this.onQuestionStatusAnsweredClicked}> <i className="fa fa-circle" style={{color: Ols.QuestionStatus.getStatusColor(Ols.QuestionStatus.ANSWERED)}}></i> Answered</a></li>
                    <li role="separator" className="divider"></li>
                    <li><a href="" onClick={this.onQuestionStatusAnswerAcceptedClicked}> <i className="fa fa-circle" style={{color: Ols.QuestionStatus.getStatusColor(Ols.QuestionStatus.ANSWER_ACCEPTED)}}></i> Answer Accepted</a></li>
                    <li><a href="" onClick={this.onQuestionStatusInvalidClicked}> <i className="fa fa-circle" style={{color: Ols.QuestionStatus.getStatusColor(Ols.QuestionStatus.INVALID)}}></i> Invalid</a></li>
                    <li><a href="" onClick={this.onQuestionStatusDuplicateClicked}> <i className="fa fa-circle" style={{color: Ols.QuestionStatus.getStatusColor(Ols.QuestionStatus.DUPLICATE)}}></i> Duplicate</a></li>
                    <li><a href="" onClick={this.onQuestionStatusOutOfScopeClicked}> <i className="fa fa-circle" style={{color: Ols.QuestionStatus.getStatusColor(Ols.QuestionStatus.OUT_OF_SCOPE)}}></i> Out Of Scope</a></li>
                </ul>
            </div>
        );
    },

    renderMilestoneLabel() {
        if(this.props.item.milestoneId != null) {
            var milestone = _.findWhere(this.props.milestoneList, {_id: this.props.item.milestoneId});
            if(milestone == null) {
                return (<span><i className="fa fa-exclamation-circle" style={{color:'red'}}></i> Invalid Milestone</span>);
            } else {
                return (<span><i className="fa fa-flag-checkered"></i> {milestone.title}</span>);

            }
        } else {
            return (<span><i className="fa fa-bars"> </i> Backlog</span>);
        }

    },

    getMilestoneDropdownClassName() {
        var className = "btn btn-xs btn-default dropdown-toggle ";
        if(this.props.item.milestoneId == null) {
            className += "btn-backlog";
        }
        return className;
    },

    renderMilestoneDropdown() {
        return (
            <span className="dropdown">
                <button className={this.getMilestoneDropdownClassName()} type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    {this.renderMilestoneLabel()} <span className="caret"></span>
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                    {this.renderMilestoneDropdownItems()}
                    <li role="separator" className="divider"></li>
                    <li><a onClick={this.onBacklogClicked} href="#">Backlog</a></li>
                </ul>
            </span>
        );
    },

    renderMilestoneDropdownItems() {
        var self = this;
        if(this.props.milestoneList.length == 0) {
            return <li className="dropdown-header">Project has no milestones</li>
        } else {
            return this.props.milestoneList.map(function (milestone) {
                return <MilestoneDropdownItem key={milestone._id} milestone={milestone}
                                              onMilestoneSelected={self.onMilestoneSelected}/>
            });
        }
    },

    onMilestoneSelected(milestone) {
        Items.methods.addItemToMilestone.call({
            itemId: this.props.item._id,
            milestoneId: milestone._id
        }, (err) => {
            if(err) {
                toastr.error("Error adding item to milestone: " + err.reason);
            }
        });
    },

    renderKey() {
        if(this.props.item.key == -1) {
            return <i className="fa fa-spin fa-spinner"></i>;
        } else {
            return <b>{this.props.item.projectKey}-{this.props.item.seq}:</b>;
        }
    },

    renderDescription() {
      if(this.state.showDescription) {
          return (
              <div className="item-description markdown-content"
                   dangerouslySetInnerHTML={ this.getHtmlContent(this.props.item.content) } />
          );
      }
    },

    getHtmlContent: function(content) {
        if ( content ) {
            return { __html: parseMarkdown(content) };
        } else {
            return {__html: '<i>No Description</i>'};
        }
    },

    renderRefList() {
        if(this.state.showRefList) {
            return <RefList refList={this.data.refList} />;
        }
    },

    renderActivityList() {
        if(this.state.showActivityList) {
            return <ActivityList activityList={this.data.activityList} />;
        }
    },

    renderSelectedLinks() {
        if(this.state.isSelected || this.props.detailMode) {
            return (
                <div style={{paddingLeft:'30px',marginTop:'10px'}}>
                    <div className="btn-group" role="group" aria-label="...">
                        {this.renderDetailLink()}
                        <button type="button" className={this.getRefsLinkClassName()} onClick={this.onRefsClicked}><i className="fa fa-hashtag"></i> References</button>
                        <button type="button" className={this.getActivityLinkClassName()} onClick={this.onActivityClicked}><i className="fa fa-exchange"></i> Activity</button>
                    </div>
                    <div className="pull-right">
                        <div className="dropdown" style={{position:'relative',top:'0px'}}>
                            <button className="btn btn-xs btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                <i className="fa fa-ellipsis-v"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu1">
                                <li><a href="">Show Details</a></li>
                                <li><a onClick={this.onUpdateDescriptionClicked} href="">Update Description</a></li>
                                <li><a onClick={this.onRenameClicked} href="">Rename</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a onClick={this.onChangeAssigneeClicked} href="">Change Assignee</a></li>
                                <li><a onClick={this.onRemoveAssigneeClicked} href="">Remove Assignee</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a onClick={this.onSetPriorityClicked} href="">Set Priority</a></li>
                                <li><a onClick={this.onRemovePriorityClicked} href="">Remove Priority</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a href="" onClick={this.onArchivedClicked}>{this.renderArchiveLabel()}</a></li>
                                <li><a href="" onClick={this.onDeleteClicked}>Delete</a></li>
                            </ul>
                        </div>
                    </div>

                </div>
            );
        } else {
            return <div></div>
        }
    },

    getDescriptionLinkClassName() {
        var className = 'btn btn-xs btn-link ';
        if(this.state.showDescription) {
            className += 'active';
        }
        return className;
    },

    getRefsLinkClassName() {
        var className = 'btn btn-xs btn-link ';
        if(this.state.showRefList) {
            className += 'active';
        }
        return className;
    },

    getActivityLinkClassName() {
        var className = 'btn btn-xs btn-link ';
        if(this.state.showActivityList) {
            className += 'active';
        }
        return className;
    },

    renderDetailLink() {
        if(this.props.detailMode) {
            return <button type="button" className={this.getDescriptionLinkClassName()} onClick={this.onDescriptionClicked}><i className='fa fa-book'></i> Description</button>
        } else {
            return <button type="button" className="btn btn-xs btn-link" onClick={this.onDetailClicked}><i className={this.getItemTypeClassName('fa')}></i> Details</button>
        }
    },

    renderArchiveLabel: function() {
        return this.props.item.isArchived? 'Restore':'Archive';
    },

    onTitleClicked: function() {
        this.setState({'isSelected': !this.state.isSelected});
    },

    onDetailClicked: function(e) {
        e.preventDefault();
        FlowRouter.setQueryParams({'rightView': 'ITEM_DETAIL', 'itemId': this.props.item._id});
    },

    onJumpClicked: function() {
        FlowRouter.go('projectPageStartSeq', {
            projectId: this.props.item.projectId,
            startMessageSeq: this.props.item.messageSeq
        }, {
            scrollTop: true,
            selectStartMessage: true
        });
    },

    onDescriptionClicked: function() {
        if(this.state.showDescription == false) {
            this.setState({showRefList: false, showActivityList: false, showDescription: true});
        }
    },

    onRefsClicked: function() {
        if(this.state.showRefList == true) {
            //If ref list is already showing then allow it to be collapsed if not in detail mode.
            if(this.props.detailMode == false) {
                this.setState({showRefList: false});
            }
        } else {
            //If ref list is not showing, then we show it and make sure the activity list is hidden.
            this.setState({showRefList: true, showActivityList: false, showDescription:false});
        }
    },

    onActivityClicked: function() {
        if(this.state.showActivityList == true) {
            //If activity list is already showing then allow it to be collapsed if not in detail mode.
            if(this.props.detailMode == false) {
                this.setState({showActivityList: false});
            }
        } else {
            //If activity list is not showing, then we show it and make sure the ref list is hidden.
            this.setState({showActivityList: true, showRefList: false, showDescription:false});
        }
    },

    onArchivedClicked() {
        if(this.props.item.isArchived) {
            Items.methods.restoreItem.call({
                itemId: this.props.item._id
            }, (err) => {
                if (err) {
                    toastr.error("Error restoring item: " + err.reason);
                }
            });
        } else {
            Items.methods.archiveItem.call({
                itemId: this.props.item._id
            }, (err) => {
                if (err) {
                    toastr.error("Error archiving item: " + err.reason);
                }
            });
        }
    },

    onStatusNewClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.Status.NEW);
    },

    onStatusOpenClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.Status.OPEN);
    },

    onStatusInProgressClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.Status.IN_PROGRESS);
    },

    onStatusBlockedClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.Status.BLOCKED);
    },

    onStatusInTestClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.Status.IN_TEST);
    },

    onStatusDoneClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.Status.DONE);
    },

    onStatusRejectedClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.Status.REJECTED);
    },

    onStatusDuplicateClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.Status.DUPLICATE);
    },

    onStatusOutOfScopeClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.Status.OUT_OF_SCOPE);
    },

    onQuestionStatusUnansweredClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.QuestionStatus.UNANSWERED);
    },

    onQuestionStatusBlockedClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.QuestionStatus.BLOCKED);
    },

    onQuestionStatusAnsweredClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.QuestionStatus.ANSWERED);
    },

    onQuestionStatusAnswerAcceptedClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.QuestionStatus.ANSWER_ACCEPTED);
    },

    onQuestionStatusInvalidClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.QuestionStatus.INVALID);
    },

    onQuestionStatusDuplicateClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.QuestionStatus.DUPLICATE);
    },

    onQuestionStatusOutOfScopeClicked(e) {
        e.preventDefault();
        this.updateItemStatus(Ols.QuestionStatus.OUT_OF_SCOPE);
    },

    onBacklogClicked(e) {
        e.preventDefault();
        Items.methods.moveItemToBacklog.call({
            itemId: this.props.item._id,
        }, (err) => {
            if(err) {
                toastr.error("Error moving item to backlog: " + err.reason);
            }
        });
    },

    onDiscussionTypeClicked(e) {
        e.preventDefault();
        this.updateItemType(Ols.Item.ITEM_TYPE_INFO, Ols.Item.INFO_SUBTYPE_DISCUSSION);
    },

    onBugTypeClicked(e) {
        e.preventDefault();
        this.updateItemType(Ols.Item.ITEM_TYPE_ISSUE, Ols.Item.ISSUE_SUBTYPE_BUG);
    },

    onQuestionTypeClicked(e) {
        e.preventDefault();
        this.updateItemType(Ols.Item.ITEM_TYPE_INFO, Ols.Item.INFO_SUBTYPE_QUESTION);
    },

    onTaskTypeClicked(e) {
        e.preventDefault();
        this.updateItemType(Ols.Item.ITEM_TYPE_ACTION, Ols.Item.ACTION_SUBTYPE_TASK);
    },

    onSetPriorityClicked(e) {
        e.preventDefault();
        var self = this;
        bootbox.prompt({title: "Set Priority:", value: this.props.item.priority, callback: function(priority) {
            if (priority !== null) {
                priority = parseInt(priority);
                Items.methods.updateItemPriority.call({
                    itemId: self.props.item._id,
                    priority
                }, (err) => {
                    if (err) {
                        toastr.error("Error setting item priority: " + err.reason);
                    }
                });
            }
        }});
    },

    onRemovePriorityClicked(e) {
        e.preventDefault();
        Items.methods.removeItemPriority.call({
            itemId: this.props.item._id
        }, (err) => {
            if (err) {
                toastr.error("Error removing priority: " + err.reason);
            }
        });
    },


    updateItemStatus(status) {
        Items.methods.updateItemStatus.call({
            itemId: this.props.item._id,
            status
        }, (err) => {
            if(err) {
                toastr.error("Error updating item status: " + err.reason);
            }
        });
    },

    updateItemType(type, subType) {
        Items.methods.updateItemType.call({
            itemId: this.props.item._id,
            type,
            subType
        }, (err) => {
            if(err) {
                toastr.error("Error updating item type: " + err.reason);
            }
        });
    },

    onRenameClicked(e) {
        e.preventDefault();
        var self = this;
        bootbox.prompt({title: "Enter new title:", value: this.props.item.description, callback: function(title) {
            if (title!== null) {
                Items.methods.setTitle.call({
                    itemId: self.props.item._id,
                    title: title
                }, (err) => {
                    if(err) {
                        toastr.error("Error renaming item: " + err.reason);
                    }
                });
            }
        }});
    },

    onDeleteClicked(e) {
        e.preventDefault();
        var self = this;
        bootbox.confirm("Are you sure you want to permanently delete this " + this.props.item.subType + "?  Consider archiving it instead, if you just want to hide it from view without destroying it forever.", function(result) {
            if(result == true) {
                Items.methods.removeItem.call({
                    itemId: self.props.item._id
                }, (err) => {
                    if (err) {
                        toastr.error("Error removing item: " + err.reason);
                    } else {
                        if(self.props.detailMode) {
                            FlowRouter.setQueryParams({'rightView': 'PROJECT_SUMMARY'});
                        }
                    }
                });
            }
        });
    },

    onChangeAssigneeClicked(e) {
        var self = this;
        e.preventDefault();
        bootbox.prompt({title: "Enter username to assign this " + this.props.item.subType + " to:", value: this.props.item.assignee, callback: function(username) {
            if (username !== null && username.length > 0) {
                Items.methods.setAssignee.call({
                    itemId: self.props.item._id,
                    assignee: username
                }, (err) => {
                    if (err) {
                        toastr.error("Error assigning item: " + err.reason);
                    }
                });
            }
        }});
    },

    onRemoveAssigneeClicked(e) {
        e.preventDefault();
        Items.methods.removeAssignee.call({
            itemId: this.props.item._id
        }, (err) => {
            if (err) {
                toastr.error("Error unassigning item: " + err.reason);
            }
        });
    },

    onUpdateDescriptionClicked() {
        var self = this;
        var description = "";
        if(this.props.item.content) {
            description = this.props.item.content;
        }
        bootbox.dialog({
            message: '<textarea id="update-item-description-textarea" rows=10 style="width:100%;border:1px solid lightgray" type="text" name="content">' + description + '</textarea>',
            title: "Edit Message",
            buttons: {
                main: {
                    label: "Save",
                    className: "btn-primary",
                    callback: function (result) {
                        var description = $('#update-item-description-textarea').val();
                        if(description != null) {
                            description = description.trim();
                            Items.methods.setDescription.call({
                                itemId: self.props.item._id,
                                description
                            }, (err) => {
                                if(err) {
                                    toastr.error("Error updating item description: " + err.reason);
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
    }
});

