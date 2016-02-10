SystemMessage = React.createClass({
    render() {
        return (
            <li className={this.props.message.isError?'message-item error':'message-item success'}>
                <span className="message-content"><i className="fa fa-exchange"></i> {this.props.message.content}</span>
            </li>
        );
    }
});
