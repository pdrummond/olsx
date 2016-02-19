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
        var milestonesHandle = Meteor.subscribe('milestones', this.props.projectId);

        if(milestonesHandle.ready()) {
            var filter = Ols.Filter.parseString(this.state.filterInput);
            data.milestoneList = Milestones.find(filter, {sort: {updatedAt: -1}}).fetch();
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
