ActionListComponent = React.createClass({
    render() {
        return (
            <ItemListComponent projectId={this.props.projectId} filter={{type: Ols.Item.ITEM_TYPE_ACTION}} />
        )
    }
});
