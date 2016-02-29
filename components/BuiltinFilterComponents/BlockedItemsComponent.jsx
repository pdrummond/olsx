BlockedItemsComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                projectTemplate={this.props.projectTemplate}
                filter={ {isArchived:false, status:Ols.Status.BLOCKED} }
                newItemStatus={Ols.Status.BLOCKED}
            />
        )
    }
});
