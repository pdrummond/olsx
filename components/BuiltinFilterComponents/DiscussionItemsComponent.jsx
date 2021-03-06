DiscussionItemsComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                projectTemplate={this.props.projectTemplate}
                filter={{type: Ols.Item.ITEM_TYPE_INFO, subType: Ols.Item.INFO_SUBTYPE_DISCUSSION, isArchived:false}}
                newItemType={Ols.Item.ITEM_TYPE_INFO}
                newItemSubType={Ols.Item.INFO_SUBTYPE_DISCUSSION}
            />
        )
    }
});
