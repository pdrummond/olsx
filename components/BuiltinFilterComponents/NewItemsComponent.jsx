NewItemsComponent = React.createClass({
    render() {
        return (
            <ItemListComponent projectId={this.props.projectId} filter={ {isArchived:false, status:Ols.Status.NEW} } />
        )
    }
});
