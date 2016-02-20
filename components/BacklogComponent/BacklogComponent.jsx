BacklogComponent = React.createClass({
    render() {
        return (
            <ItemListComponent projectId={this.props.projectId} filter={ {milestoneId: {$exists:false}, isArchived:false} } />
        )
    }
});
