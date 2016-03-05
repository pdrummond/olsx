RefTag = React.createClass({

    render() {
        return (
                <span onClick={this.onClicked} style={{marginRight: '5px', fontSize:'10px', cursor:'pointer'}} className="label label-ref">
                    #{this.props.projectKey}-{this.props.refItem.itemSeq}
                </span>
            );
    },

    onClicked() {
        FlowRouter.setQueryParams({itemId: this.props.refItem.itemId});
    }
});
