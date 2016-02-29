MemberListContainer = React.createClass({

    render() {
        return (
            <div className="member-list-container">
                <form className="new-member" onSubmit={this.handleSubmit} >
                    <input className="new-member-input"
                           type="text"
                           ref="textInput"
                           placeholder="Type username to add member"/>
                </form>
                <MemberList
                    showMembersOnly={this.props.showMembersOnly}
                    memberList={this.props.memberList} />
            </div>
        )
    },

    handleSubmit(event) {
        event.preventDefault();
        var emailOrUsername = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

        Members.methods.addMember.call({emailOrUsername, projectId: this.props.projectId, role:Ols.Role.ROLE_USER}, (err, member) => {
            if(err) {
                toastr.error('Unable to add member: ' + err.reason);
                console.error('Error adding member: ' + JSON.stringify(err, null, 2));
            }
        });
        ReactDOM.findDOMNode(this.refs.textInput).value = "";
    }
});
