InTestItemsComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                projectTemplate={this.props.projectTemplate}
                filter={ {isArchived:false, status:Ols.Status.IN_TEST} }
                newItemStatus={Ols.Status.IN_TEST}
            />
        )
    }
});
