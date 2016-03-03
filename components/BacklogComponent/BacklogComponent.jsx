BacklogComponent = React.createClass({
    render() {
        return (
            <ItemListComponent
                projectId={this.props.projectId}
                projectTemplate={this.props.projectTemplate}
                filter={{
                    milestoneId: {$exists:false},
                    isArchived:false,
                    status: {$lte: Ols.Status.OPEN},
                    $or: [{subType: Ols.Item.ACTION_SUBTYPE_TASK}, {subType: Ols.Item.ISSUE_SUBTYPE_BUG}]
                }} />
        )
    }
});
