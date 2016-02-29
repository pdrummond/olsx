BacklogComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                projectTemplate={this.props.projectTemplate}
                filter={ {milestoneId: {$exists:false}, isArchived:false} } />
        )
    }
});
