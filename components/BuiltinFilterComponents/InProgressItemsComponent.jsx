InProgressItemsComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                filter={ {isArchived:false, status:Ols.Status.IN_PROGRESS} }
                newItemStatus={Ols.Status.IN_PROGRESS}
            />
        )
    }
});
