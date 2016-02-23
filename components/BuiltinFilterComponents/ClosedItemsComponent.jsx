ClosedItemsComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                filter={ {isArchived:false, status: {$gte: Ols.Status.DONE}} }
                newItemStatus={Ols.Status.DONE}
            />
        )
    }
});
