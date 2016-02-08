Member = React.createClass({
    render() {
        return (
            <li onClick={this.onClick} className="member">{this.props.member.username}</li>
        )
    },

    onClick: function() {
        this.props.onClick(this.props.member);
    }
});
