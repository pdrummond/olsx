BlockedItemsComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                filter={ {isArchived:false, status:Ols.Status.BLOCKED} }
                newItemStatus={Ols.Status.BLOCKED}
            />
        )
    }
});
