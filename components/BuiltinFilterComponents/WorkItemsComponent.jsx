WorkItemsComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                filter={{isArchived:false, status: {$lt: Ols.Status.DONE}, milestoneId: {$exists:true}}}
            />
        )
    }
});
