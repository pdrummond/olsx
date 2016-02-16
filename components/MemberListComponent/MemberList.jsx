MemberList = React.createClass({
    renderMembers() {
        if(this.props.memberList) {
            return this.props.memberList.map((member) => {
                return <Member onClick={this.props.onMemberClicked} key={member._id} member={member}/>;
            });
        } else {
            return <p style={{textAlign: 'center', color: 'lightgray'}}>
                <i className="fa fa-spin fa-2x fa-spinner"></i>
            </p>;
        }
    },

    render() {
        return (
            <ul className="member-list">
                {this.renderMembers()}
            </ul>
        )
    }
});
