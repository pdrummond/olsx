TaskList = React.createClass({
    renderTasks() {
        if(this.props.taskList) {
            return this.props.taskList.map((task) => {
                return <Task milestoneList={this.props.milestoneList} key={task._id} task={task}/>;
            });
        } else {
            return <p style={{textAlign: 'center', color: 'lightgray'}}>
                <i className="fa fa-spin fa-2x fa-spinner"></i>
            </p>;
        }
    },

    render() {

            if(this.props.taskList.length == 0) {
                return (
                    <ul className="task-list">
                        <li><i style={{color:'gray'}}>No existing items found - press ENTER to create</i></li>
                    </ul>
                );
            } else {
                return (
                    <ul className="task-list">
                    {this.renderTasks()}
                </ul>
                )
            }
    }
});
