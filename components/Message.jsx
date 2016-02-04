Message = React.createClass({
    propTypes: {
        message: React.PropTypes.object.isRequired
    },

    render() {
       return (
           <li><b>{this.props.message.createdBy}</b>: {this.props.message.content} - {this.props.message.createdAt}</li>
       )
    }
});