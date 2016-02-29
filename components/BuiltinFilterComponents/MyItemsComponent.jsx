MyItemsComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                projectTemplate={this.props.projectTemplate}
                filter={ {assignee: Meteor.user().username, isArchived:false} }
                newItemAssignee={Meteor.user().username}
            />
        )
    }
});
