TaskListComponent = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            filterInput: ''
        }
    },

    getMeteorData() {
        var data = {};
        data.taskList = [];
        data.milestoneList = [];
        var tasksHandle = Meteor.subscribe('tasks', this.props.projectId);
        var refsHandle = Meteor.subscribe('refs', this.props.projectId);
        var milestonesHandle = Meteor.subscribe('milestones', this.props.projectId);
        if(tasksHandle.ready() && refsHandle.ready() && milestonesHandle.ready()) {
            var inputFilter = Ols.Filter.parseString(this.state.filterInput);
            var filter = this.props.filter ? _.extend(inputFilter, this.props.filter) : _.extend(inputFilter, {isArchived:false});
            data.taskList = Items.find(filter, {sort: {createdAt: -1}}).fetch();

            data.milestoneList = Milestones.find({}, {sort: {createdAt: 1}}).fetch();

            data.authInProcess = Meteor.loggingIn();
        }
        return data;
    },

    render() {
        return (
            <div className="task-list-component">
                <form className="filter-task" onSubmit={this.handleSubmit}>
                    <input className="filter-task-input"
                           type="text"
                           ref="filterInput"
                           placeholder="Type here to create task/filter list"
                           onKeyUp={this.onKeyUp} />
                </form>
                <TaskList
                    milestoneList={this.data.milestoneList}
                    taskList={this.data.taskList}/>
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
        var description = this.refs.filterInput.value;
        this.setState({'filterInput': description});
        if (description) {
            this.addTask(description);
        }
    },

    addTask(description) {
        var self = this;
        Items.methods.addItem.call({
            description: description,
            projectId: this.props.projectId,
            type: Ols.Item.ITEM_TYPE_ACTION,
            subType:Ols.Item.ACTION_SUBTYPE_TASK,
        }, (err, task) => {
            if (err) {
                if (err.reason) {
                    toastr.error("Error adding task: " + err.reason);
                } else {
                    console.error("Error adding task: " + JSON.stringify(err));
                }
            }
            self.refs.filterInput.value= ''
            self.setState({'filterInput': ''});
        });
    }


});
