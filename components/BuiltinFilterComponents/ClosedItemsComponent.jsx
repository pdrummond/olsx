ClosedItemsComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                projectTemplate={this.props.projectTemplate}
                filter={ {isArchived:false, status: {$gte: Ols.Status.DONE}} }
                newItemStatus={Ols.Status.DONE}
            />
        )
    }
});
