Item = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            isSelected: false,
            showRefList: false
        }
    },

    getMeteorData() {
        var data = {};
        data.refList = Refs.find({
                projectId: this.props.item.projectId,
                itemId: this.props.item._id
            }, {
                sort: {createdAt: -1}
            }).fetch();
        console.log("Item.getMeteorData() refList = " + JSON.stringify(data.refList));
        return data;
    },

    styles: {
        itemIcon: {
            float: 'left',
            width: '35px',
            position: 'relative',
            top: '5px'
        }
    },

    render() {
        return (
            <li className={this.state.isSelected?'item active':'item'}>
                <div className="item-wrapper">
                    {this.renderTypeDropdown()}
                    <div style={{paddingLeft: '0px'}}>
                        <div onClick={this.onDescriptionClicked}
                             className="item-description"
                             style={{fontSize: '14px', fontWeight: 'bold', color:'gray'}}>
                                {this.props.item.description}
                        </div>
                        <div style={{fontSize:'12px',color:'gray', paddingLeft:'35px', paddingTop:'5px', paddingBottom:'5px'}}>
                            {this.renderKey()} Created by {this.props.item.createdByName} {moment(this.props.item.createdAt).fromNow()}
                        </div>
                    </div>
                    <div className="labels" style={{paddingLeft:'35px'}}>
                        <span className="label label-default" style={{backgroundColor:Ols.Status.getStatusColor(this.props.item.status)}}><i className="fa fa-circle"></i> {Ols.Status.getStatusLabel(this.props.item.status)}</span>
                        {/*<span className="label label-default"><i className="fa fa-flag-checkered"></i> Milestone 1</span>
                        <span className="label label-primary"><i className="fa fa-flag"></i> Sprint 44</span>*/}
                        {this.renderMilestoneDropdown()}
                        {this.renderPriorityBadge()}
                    </div>
                    {this.renderSelectedLinks()}
                </div>
                {this.renderRefList()}
            </li>
        )
    },

    renderTypeDropdown() {
        return(
            <span className="dropdown pull-left" style={{width:'35px'}}>
                <button className="item-type-dropdown-button btn btn-xs btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    <i style={this.styles.itemIcon} className={this.renderItemTypeClassName()}></i>
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                    <li><a onClick={this.onTaskTypeClicked} href="#"><i className="fa fa-exclamation-circle"></i> Task</a></li>
                    <li><a onClick={this.onBugTypeClicked} href="#"><i className="fa fa-bug"></i> Bug</a></li>
                </ul>
            </span>
        );
    },

    renderItemTypeClassName() {
        var className = 'fa fa-2x ';
        switch(this.props.item.subType) {
            case Ols.Item.ACTION_SUBTYPE_TASK: className += 'fa-exclamation-circle'; break;
            case Ols.Item.ISSUE_SUBTYPE_BUG: className += 'fa-bug'; break;
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

    renderMilestoneLabel() {
        if(this.props.item.milestoneId != null) {
            var milestone = _.findWhere(this.props.milestoneList, {_id: this.props.item.milestoneId});
            if(milestone == null) {
                return (<i className="fa fa-exclamation-circle" style={{color:'red'}}> Invalid Milestone</i>);
            } else {
                return (<i className="fa fa-flag-checkered"> {milestone.title}</i>);

            }
        } else {
            return (<i className="fa fa-bars"> Backlog </i>);
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

    renderRefList() {
        if(this.state.showRefList) {
            return <RefList refList={this.data.refList} />;
        } else {
            return null;
        }
    },

    renderSelectedLinks() {
        if(this.state.isSelected) {
            return (
                <div>
                    <div className="btn-group" role="group" aria-label="...">
                        <button type="button" className="btn btn-link" onClick={this.onJumpClicked}><i className="fa fa-mail-reply"></i> Jump</button>
                        <button type="button" className="btn btn-link" onClick={this.onRefsClicked}><i className="fa fa-hashtag"></i> References</button>
                        <button type="button" className="btn btn-link" onClick={this.onArchivedClicked}><i className="fa fa-archive"></i> {this.renderArchiveLabel()}</button>
                    </div>
                    <div className="pull-right">
                        <div className="dropdown" style={{position:'relative',top:'5px'}}>
                            <button className="btn btn-xs btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                <i className="fa fa-ellipsis-v"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu1">
                                <li><a href="">Show Details</a></li>
                                <li><a onClick={this.onRenameClicked} href="">Rename</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a onClick={this.onSetPriorityClicked} href="">Set Priority</a></li>
                                <li><a onClick={this.onRemovePriorityClicked} href="">Remove Priority</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a href="" onClick={this.onStatusNewClicked}>Set status to New</a></li>
                                <li><a href="" onClick={this.onStatusOpenClicked}>Set status to Open</a></li>
                                <li><a href="" onClick={this.onStatusInProgressClicked}>Set status to In Progress</a></li>
                                <li><a href="" onClick={this.onStatusBlockedClicked}>Set status to Blocked</a></li>
                                <li><a href="" onClick={this.onStatusInTestClicked}>Set status to In Test</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a href="" onClick={this.onStatusDoneClicked}>Set status to Done</a></li>
                                <li><a href="" onClick={this.onStatusRejectedClicked}>Set status to Rejected</a></li>
                                <li><a href="" onClick={this.onStatusDuplicateClicked}>Set status to Duplicate</a></li>
                                <li><a href="" onClick={this.onStatusOutOfScopeClicked}>Set status to Out of Scope</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a href="">Delete</a></li>
                            </ul>
                        </div>
                    </div>

                </div>
            );
        } else {
            return <div></div>
        }
    },

    renderArchiveLabel: function() {
        return this.props.item.isArchived? 'Restore':'Archive';
    },

    onDescriptionClicked: function() {
        this.setState({'isSelected': !this.state.isSelected});
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

    onRefsClicked: function() {
        this.setState({'showRefList': !this.state.showRefList});
    },

    onArchivedClicked() {
        if(this.props.item.isArchived) {
            Items.methods.restoreItem.call({
                projectId: this.props.item.projectId,
                seq: this.props.item.seq,
            }, (err) => {
                if (err) {
                    toastr.error("Error restoring item: " + err.reason);
                }
            });
        } else {
            Items.methods.archiveItem.call({
                projectId: this.props.item.projectId,
                seq: this.props.item.seq,
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

    onBugTypeClicked(e) {
        e.preventDefault();
        this.updateItemType(Ols.Item.ITEM_TYPE_ISSUE, Ols.Item.ISSUE_SUBTYPE_BUG);
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
            itemId: this.props.item._id,
        }, (err) => {
            if (err) {
                toastr.error("Error removing priority: " + err.reason);
            }
        });
    },


    updateItemStatus(status) {
        Items.methods.updateItemStatus.call({
            projectId: this.props.item.projectId,
            seq:this.props.item.seq,
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
    }
});
