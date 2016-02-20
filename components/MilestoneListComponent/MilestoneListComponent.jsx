MilestoneListComponent = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            filterInput: ''
        }
    },

    getMeteorData() {
        var data = {};
        data.milestoneList = [];
        data.releaseIdParam = FlowRouter.getQueryParam('releaseId');
        var milestonesHandle = Meteor.subscribe('milestones', this.props.projectId);
        var releasesHandle = Meteor.subscribe('releases', this.props.projectId);
        if(milestonesHandle.ready() && releasesHandle.ready()) {
            var inputFilter = Ols.Filter.parseString(this.state.filterInput);
            var filter = this.props.filter ? _.extend(inputFilter, this.props.filter) : inputFilter;
            data.milestoneList = Milestones.find(filter, {sort: {updatedAt: -1}}).fetch();
            data.releaseList = Releases.find({}, {sort: {createdAt: 1}}).fetch();
            data.authInProcess = Meteor.loggingIn();
        }
        return data;
    },

    render() {
        return (
            <div className="milestone-list-component">
                <form className="filter-milestone" onSubmit={this.handleSubmit}>
                    <input className="filter-milestone-input"
                           type="text"
                           ref="filterInput"
                           placeholder="Type here to create milestone/filter list"
                           onKeyUp={this.onKeyUp} />
                </form>
                <MilestoneList
                    releaseList={this.data.releaseList}
                    milestoneList={this.data.milestoneList}/>
            </div>
        )
    },

    onKeyUp: function() {
        var self = this;
        if(this.filterInputKeyTimer) {
            console.log("CANCELLED FILTER KEY TIMER");
            clearTimeout(this.filterInputKeyTimer);
        }
        this.filterInputKeyTimer = setTimeout(function() {
            self.setState({'filterInput': self.refs.filterInput.value});
        }, 500);
    },

    handleSubmit(e) {
        e.preventDefault();
        clearTimeout(this.filterInputKeyTimer);
        var title = this.refs.filterInput.value;
        this.setState({'filterInput': title});
        if (title) {
            this.addMilestone(title);
        }
    },

    addMilestone(title) {
        var self = this;
        Milestones.methods.addMilestone.call({
            title,
            projectId: this.props.projectId,
            releaseId: this.data.releaseIdParam
        }, (err, milestone) => {
            if (err) {
                if (err.reason) {
                    toastr.error("Error adding milestone: " + err.reason);
                } else {
                    console.error("Error adding milestone: " + JSON.stringify(err));
                }
            }
            self.refs.filterInput.value= ''
            self.setState({'filterInput': ''});
        });
    }
});
