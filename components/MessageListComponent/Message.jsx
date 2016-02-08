Message = React.createClass({
    propTypes: {
        message: React.PropTypes.object.isRequired
    },

    render() {
           if(this.props.message.isError || this.props.message.isSuccess) {
               return (
               <li className={this.props.message.isError ? 'message-item error': this.props.message.isSuccess?'message-item success':'message-item'}>
                   <span className="message-content">{this.props.message.content}</span>
                   <div className="message-created-at">{this.props.message.seq} </div>
               </li>
               );
           } else {
               return (
               <li className={this.props.message.isError ? 'message-item error': this.props.message.isSuccess?'message-item success':'message-item'}>
                   <b>{this.props.message.createdByName}:</b> <span
                   className="message-content">{this.props.message.content}</span>
                   <div className="message-created-at">{this.props.message.seq} </div>
               </li>
               );
           }
    }
});