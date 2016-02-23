MyItemsComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                filter={ {assignee: Meteor.user().username, isArchived:false} }
                newItemAssignee={Meteor.user().username}
            />
        )
    }
});
