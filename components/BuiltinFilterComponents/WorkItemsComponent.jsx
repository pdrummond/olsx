WorkItemsComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                projectTemplate={this.props.projectTemplate}
                filter={{isArchived:false, status: {$lt: Ols.Status.DONE}, milestoneId: {$exists:true}}}
            />
        )
    }
});
