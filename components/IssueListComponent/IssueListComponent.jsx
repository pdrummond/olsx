IssueListComponent = React.createClass({
    render() {
        return (
            <ItemListComponent projectId={this.props.projectId}
                               filter={{type: Ols.Item.ITEM_TYPE_ISSUE}}
                               newItemType={Ols.Item.ITEM_TYPE_ISSUE}
                               newItemSubType={Ols.Item.ISSUE_SUBTYPE_BUG} />
        )
    }
});
