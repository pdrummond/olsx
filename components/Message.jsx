Message = React.createClass({
    propTypes: {
        message: React.PropTypes.object.isRequired
    },

    render() {
       return (
           <li className="message-item"><b>{this.props.message.createdBy}</b> <span className="message-created-at"> {this.props.message.createdAt}</span>
           <div className="message-content">{this.props.message.content}</div>
           </li>
       )
    }
});