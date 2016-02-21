Milestone = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            isSelected: false
        }
    },

    propTypes: {
        milestone: React.PropTypes.object,
        showDetailLink: React.PropTypes.bool
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
                    {this.renderReleasesDropdown()}
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
                <div style={{paddingLeft:'30px'}}>
                    <div className="btn-group" role="group" aria-label="...">
                        {/*<button type="button" className="btn btn-link" onClick={this.onJumpClicked}><i className="fa fa-mail-reply"></i> Jump</button>
                        <button type="button" className="btn btn-link" onClick={this.onRefsClicked}><i className="fa fa-hashtag"></i> References</button>*/}
                        {this.renderDetailLink()}
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



    renderDetailLink() {
        if(this.props.showDetailLink) {
            return <button type="button" className="btn btn-link" onClick={this.onDetailClicked}><i
                className="fa fa-flag-checkered"></i> Details</button>
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

    onDetailClicked(e) {
        e.preventDefault();
        FlowRouter.setQueryParams({'rightView': 'MILESTONE_DETAIL', 'milestoneId': this.props.milestone._id});
    },

    onDeleteClicked(e) {
        e.preventDefault();
        Milestones.methods.removeMilestone.call({
            milestoneId: this.props.milestone._id,
        }, (err) => {
            if(err) {
                toastr.error("Error removing milestone: " + err.reason);
            } else {
                FlowRouter.setQueryParams({'rightView': 'MILESTONES'});
            }
        });
    },

    onRenameClicked(e) {
        e.preventDefault();
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
    },

    renderReleaseLabel() {
        if(this.props.milestone.releaseId != null) {
            var release = _.findWhere(this.props.releaseList, {_id: this.props.milestone.releaseId});
            if(release == null) {
                return (<i className="fa fa-exclamation-circle" style={{color:'red'}}> Invalid Release</i>);
            } else {
                return (<i className="fa fa-paper-plane"> {release.title}</i>);

            }
        } else {
            return (<i className="fa fa-bomb"> No Release </i>);
        }

    },

    renderReleasesDropdown() {
        return (
            <span className="dropdown pull-right">
                <button className="btn btn-xs btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    {this.renderReleaseLabel()} <span className="caret"></span>
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                    {this.renderReleaseDropdownItems()}
                </ul>
            </span>
        );
    },

    renderReleaseDropdownItems() {
        var self = this;
        if(this.props.releaseList.length == 0) {
            return <li className="dropdown-header">Project has no releases</li>
        } else {
            return this.props.releaseList.map(function (release) {
                return <ReleaseDropdownItem key={release._id} release={release}
                                              onReleaseSelected={self.onReleaseSelected}/>
            });
        }
    },

    onReleaseSelected(release) {
        Milestones.methods.addMilestoneToRelease.call({
            milestoneId: this.props.milestone._id,
            releaseId: release._id
        }, (err) => {
            if(err) {
                toastr.error("Error adding milestone to release: " + err.reason);
            }
        });
    }
});