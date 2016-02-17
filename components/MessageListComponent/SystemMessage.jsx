SystemMessage = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        return {
            selectStartMessage: FlowRouter.getQueryParam('selectStartMessage') == "true",
            startMessageSeq: parseInt(FlowRouter.getParam('startMessageSeq'))
        };
    },

    render() {
        return (
            <li className={this.getClassName()} onClick={this.onClick}>
                <span className="message-content">
                    <i className="fa fa-dot-circle-o"></i> {this.props.message.content}
                </span>
                <span className="message-created-at"> {moment(this.props.message.createdAt).fromNow()}</span>
            </li>
        );
    },

    getClassName() {
        var className = this.props.message.isError?'message-item error':'message-item success'
        if(this.data.selectStartMessage == true && this.data.startMessageSeq == this.props.message.seq) {
            className += ' active';
        }
        return className;
    },

    onClick: function() {
        FlowRouter.setQueryParams({selectStartMessage: null});
    }
});
