SystemMessage = React.createClass({
    render() {
        return (
            <li className={this.props.message.isError?'message-item error':'message-item success'}>
                <span className="message-content">
                    <i className="fa fa-dot-circle-o"></i> {this.props.message.content}
                </span>
                <span className="message-created-at"> {moment(this.props.message.createdAt).fromNow()} </span>
            </li>
        );
    }
});
