Task = React.createClass({
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
                projectId: this.props.task.projectId,
                itemId: this.props.task._id
            }, {
                sort: {createdAt: -1}
            }).fetch();
        console.log("Task.getMeteorData() refList = " + JSON.stringify(data.refList));
        return data;
    },

    styles: {
        taskIcon: {
            float: 'left',
            width: '35px',
            position: 'relative',
            top: '5px'
        }
    },

    render() {
        return (
            <li className={this.state.isSelected?'task active':'task'}>
                <div className="task-wrapper">
                    <i style={this.styles.taskIcon} className="fa fa-exclamation-circle fa-2x"></i>
                    <div style={{paddingLeft: '0px'}}>
                        <div onClick={this.onDescriptionClicked}
                             className="task-description"
                             style={{fontSize: '14px', fontWeight: 'bold', color:'gray'}}>
                                {this.props.task.description}
                        </div>
                        <div style={{fontSize:'12px',color:'gray', paddingLeft:'35px'}}>{this.renderKey()} Created by {this.props.task.createdByName} {moment(this.props.task.createdAt).fromNow()}</div>
                    </div>
                    <div className="labels" style={{paddingLeft:'35px'}}>
                        <span className="label label-default" style={{backgroundColor:Ols.Status.getStatusColor(this.props.task.status)}}><i className="fa fa-circle"></i> {Ols.Status.getStatusLabel(this.props.task.status)}</span>
                        {/*<span className="label label-default"><i className="fa fa-flag-checkered"></i> Milestone 1</span>
                        <span className="label label-primary"><i className="fa fa-flag"></i> Sprint 44</span>*/}
                        {this.renderMilestoneDropdown()}
                    </div>
                    {this.renderSelectedLinks()}
                </div>
                {this.renderRefList()}
            </li>
        )
    },

    renderMilestoneLabel() {
        if(this.props.task.milestoneId != null) {
            var milestone = _.findWhere(this.props.milestoneList, {_id: this.props.task.milestoneId});
            if(milestone == null) {
                return (<i className="fa fa-exclamation-circle" style={{color:'red'}}> Invalid Milestone</i>);
            } else {
                return (<i className="fa fa-flag-checkered"> {milestone.title}</i>);

            }
        } else {
            return (<i className="fa fa-bars"> Backlog </i>);
        }

    },

    renderMilestoneDropdown() {
        return (
            <span className="dropdown">
                <button className="btn btn-xs btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
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
            itemId: this.props.task._id,
            milestoneId: milestone._id
        }, (err) => {
            if(err) {
                toastr.error("Error adding task to milestone: " + err.reason);
            }
        });
    },

    renderKey() {
        if(this.props.task.key == -1) {
            return <i className="fa fa-spin fa-spinner"></i>;
        } else {
            return <b>{this.props.task.projectKey}-{this.props.task.seq}:</b>;
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
                        <div className="dropdown">
                            <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                <i className="fa fa-ellipsis-v"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu1">
                                <li><a href="">Show Details</a></li>
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
        return this.props.task.isArchived? 'Restore':'Archive';
    },

    onDescriptionClicked: function() {
        this.setState({'isSelected': !this.state.isSelected});
    },

    onJumpClicked: function() {
        FlowRouter.go('projectPageStartSeq', {
            projectId: this.props.task.projectId,
            startMessageSeq: this.props.task.messageSeq
        }, {
            scrollTop: true,
            selectStartMessage: true
        });
    },

    onRefsClicked: function() {
        this.setState({'showRefList': !this.state.showRefList});
    },

    onArchivedClicked() {
        if(this.props.task.isArchived) {
            Items.methods.restoreItem.call({
                projectId: this.props.task.projectId,
                seq: this.props.task.seq,
            }, (err) => {
                if (err) {
                    toastr.error("Error restoring task: " + err.reason);
                }
            });
        } else {
            Items.methods.archiveItem.call({
                projectId: this.props.task.projectId,
                seq: this.props.task.seq,
            }, (err) => {
                if (err) {
                    toastr.error("Error archiving task: " + err.reason);
                }
            });
        }
    },

    onStatusNewClicked() {
        this.updateTaskStatus(Ols.Status.NEW);
    },

    onStatusOpenClicked() {
        this.updateTaskStatus(Ols.Status.OPEN);
    },

    onStatusInProgressClicked() {
        this.updateTaskStatus(Ols.Status.IN_PROGRESS);
    },

    onStatusBlockedClicked() {
        this.updateTaskStatus(Ols.Status.BLOCKED);
    },

    onStatusInTestClicked() {
        this.updateTaskStatus(Ols.Status.IN_TEST);
    },

    onStatusDoneClicked() {
        this.updateTaskStatus(Ols.Status.DONE);
    },

    onStatusRejectedClicked() {
        this.updateTaskStatus(Ols.Status.REJECTED);
    },

    onStatusDuplicateClicked() {
        this.updateTaskStatus(Ols.Status.DUPLICATE);
    },

    onStatusOutOfScopeClicked() {
        this.updateTaskStatus(Ols.Status.OUT_OF_SCOPE);
    },

    onBacklogClicked() {
        Items.methods.moveItemToBacklog.call({
            itemId: this.props.task._id,
        }, (err) => {
            if(err) {
                toastr.error("Error moving item to backlog: " + err.reason);
            }
        });
    },

    updateTaskStatus(status) {
        Items.methods.updateItemStatus.call({
            projectId: this.props.task.projectId,
            seq:this.props.task.seq,
            status
        }, (err) => {
            if(err) {
                toastr.error("Error updating task status: " + err.reason);
            }
        });
    }
});
