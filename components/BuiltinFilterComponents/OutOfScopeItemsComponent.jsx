OutOfScopeItemsComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                projectTemplate={this.props.projectTemplate}
                filter={ {isArchived:false, status:Ols.Status.OUT_OF_SCOPE} }
                newItemStatus={Ols.Status.OUT_OF_SCOPE}
            />
        )
    }
});
