IssueListComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                projectTemplate={this.props.projectTemplate}
                filter={{type: Ols.Item.ITEM_TYPE_ISSUE, isArchived:false}}
                newItemType={Ols.Item.ITEM_TYPE_ISSUE}
                newItemSubType={Ols.Item.ISSUE_SUBTYPE_BUG} />
        )
    }
});
