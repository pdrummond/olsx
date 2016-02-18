ArchivedListComponent = React.createClass({
    render() {
        return (
            <TaskListComponent projectId={this.props.projectId} filter={{isArchived:true}} />
        )
    }
});
