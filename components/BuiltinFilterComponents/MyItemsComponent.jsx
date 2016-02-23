MyItemsComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                filter={ {assignee: Meteor.user().username} }
                newItemAssignee={Meteor.user().username}
            />
        )
    }
});
