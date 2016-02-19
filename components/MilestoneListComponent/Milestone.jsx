Milestone = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            isSelected: false
        }
    },

    getMeteorData: function() {
        var data = {};
        var milestoneTaskCountsHandle = Meteor.subscribe("milestoneTaskCounts", this.props.milestone._id);
        if(milestoneTaskCountsHandle.ready()) {
            var counts = MilestoneTaskCounts.findOne(this.props.milestone._id);
            if(counts != null) {
                data.totalCount = counts.totalCount;
                data.openCount = counts.openCount;
                data.doneCount = counts.doneCount;
            }
        }
        return data;
    },

    styles: {
        icon: {
            float: 'left',
            width: '20px',
            borderRadius: '10px',
            position:'relative',
            top:'5px'

        }
    },

    render() {
        return (
            <li className={this.state.isSelected?'milestone active':'milestone'}>
                <i style={this.styles.icon} className="fa fa-2x fa-flag-checkered"></i>
                <div style={{paddingLeft:'40px', fontSize: '12px'}}>
                    <span
                        onClick={this.onTitleClicked}
                        className="milestone-title">
                        {this.props.milestone.title}
                    </span>
                    <div className="progress">
                        <div className="progress-bar progress-bar-success progress-bar-striped" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style={{width: this.getProgressPercentage()}}>
                            <span className="sr-only">40% Complete (success)</span>
                        </div>
                    </div>
                    <span>open: <b>{this.data.openCount}</b> closed: <b>{this.data.doneCount}</b> total: <b>{this.data.totalCount}</b> </span>
                </div>
                {this.renderSelectedLinks()}
            </li>
        );
    },

    getProgressPercentage() {
        var p = (this.data.doneCount / this.data.totalCount) * 100;
        return p + '%';
    },

    renderSelectedLinks() {
        if(this.state.isSelected) {
            return (
                <div>
                    <div className="btn-group" role="group" aria-label="...">
                        {/*<button type="button" className="btn btn-link" onClick={this.onJumpClicked}><i className="fa fa-mail-reply"></i> Jump</button>
                        <button type="button" className="btn btn-link" onClick={this.onRefsClicked}><i className="fa fa-hashtag"></i> References</button>*/}
                        <button type="button" className="btn btn-link" onClick={this.onDeleteClicked}><i className="fa fa-trash"></i> Delete</button>
                    </div>
                    <div className="pull-right">
                        <div className="dropdown">
                            <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                <i className="fa fa-ellipsis-v"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu1">
                                {/*<li><a href="">Set Due Date</a></li>*/}
                                <li><a onClick={this.onRenameClicked} href="">Rename</a></li>
                                {/*<li role="separator" className="divider"></li>
                                <li><a href="">Activate Milestone</a></li>
                                <li><a href="">Mark Complete</a></li>*/}
                            </ul>
                        </div>
                    </div>

                </div>
            );
        } else {
            return <div></div>
        }
    },

    onJumpClicked: function() {
        FlowRouter.go('projectPageStartSeq', {
            projectId: this.props.milestone.projectId,
            startMessageSeq: this.props.milestone.messageSeq
        }, {
            scrollTop: true,
            selectStartMessage: true
        });
    },

    onTitleClicked: function() {
        this.setState({'isSelected': !this.state.isSelected});
    },

    onDeleteClicked() {
        Milestones.methods.removeMilestone.call({
            milestoneId: this.props.milestone._id,
        }, (err) => {
            if(err) {
                toastr.error("Error removing milestone: " + err.reason);
            }
        });
    },

    onRenameClicked() {
        var self = this;
        bootbox.prompt({title: "Enter new title for milestone:", value: this.props.milestone.title, callback: function(title) {
            if (title!== null) {
                Milestones.methods.setTitle.call({
                    milestoneId: self.props.milestone._id,
                    title: title
                }, (err) => {
                    if(err) {
                        toastr.error("Error renaming milestone: " + err.reason);
                    }
                });
            }
        }});
    }
});