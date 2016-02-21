QuestionListComponent = React.createClass({
    render() {
        return (
            <ItemListComponent projectId={this.props.projectId}
                               filter={{type: Ols.Item.ITEM_TYPE_INFO, subType: Ols.Item.INFO_SUBTYPE_QUESTION, isArchived:false}}
                               newItemType={Ols.Item.ITEM_TYPE_INFO}
                               newItemSubType={Ols.Item.INFO_SUBTYPE_QUESTION} />
        )
    }
});
