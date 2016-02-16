TaskListComponent = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        var data = {};
        data.taskList = [];
        var tasksHandle = Meteor.subscribe('tasks');

        if(tasksHandle.ready()) {
            data.taskList = Tasks.find({}, {sort: {updatedAt: -1}}).fetch();
            data.authInProcess = Meteor.loggingIn();
        }
        return data;
    },

    render() {
        return (
            <div className="task-list-component">
                <form className="filter-task" >
                    <input className="filter-task-input"
                           type="text"
                           ref="textInput"
                           placeholder="Type here to filter tasks"/>
                </form>
                <TaskList
                    taskList={this.data.taskList}/>
            </div>
        )
    },


});
