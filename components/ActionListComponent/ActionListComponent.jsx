ActionListComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                projectTemplate={this.props.projectTemplate}
                filter={{type: Ols.Item.ITEM_TYPE_ACTION, isArchived:false}} />
        )
    }
});
