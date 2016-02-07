Message = React.createClass({
    propTypes: {
        message: React.PropTypes.object.isRequired
    },

    render() {
       return (
           <li className={this.props.message.isError ? 'message-item error':'message-item'}><b>{this.props.message.createdByName}:</b> <span className="message-content">{this.props.message.content}</span>
               <div className="message-created-at">{this.props.message.seq} </div>
           </li>
       )
    }
});