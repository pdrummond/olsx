TaskListComponent = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        var data = {};
        data.taskList = [];
        var tasksHandle = Meteor.subscribe('tasks', this.props.conversationId);
        var refsHandle = Meteor.subscribe('refs', this.props.conversationId);

        if(tasksHandle.ready() && refsHandle.ready()) {
            data.taskList = Tasks.find({conversationId:this.props.conversationId}, {sort: {updatedAt: -1}}).fetch();
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
                           placeholder="Type here to create task/filter list"/>
                </form>
                <TaskList
                    taskList={this.data.taskList}/>
            </div>
        )
    },


});
