MemberListContainer = React.createClass({

    render() {
        return (
            <div className="member-list-container">
                <form className="new-member" onSubmit={this.handleSubmit} >
                    <input className="new-member-input"
                           type="text"
                           ref="textInput"
                           placeholder="Type email/username to add member"/>
                </form>
                <MemberList
                    memberList={this.props.memberList} onMemberClicked={this.onMemberClicked} />
            </div>
        )
    },

    onMemberClicked(memberToRemove) {
        var currentMember = Members.findOne({userId: Meteor.userId()});
        if(currentMember.role == Ols.Role.ROLE_ADMIN) {
            if(confirm("Do you wish to remove this member from the project?")) {
                Members.methods.removeMember.call({memberId: memberToRemove._id}, (err) => {
                    if (err) {
                        toastr.error('Unable to remove member: ' + err.reason);
                    } else {
                        Ols.Message.systemSuccessMessage(this.props.projectId, Meteor.user().username + " removed " + memberToRemove.username + " from this project");
                    }
                });
            }
        }
    },

    handleSubmit(event) {
        event.preventDefault();
        var emailOrUsername = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

        Members.methods.addMember.call({emailOrUsername, projectId: this.props.projectId, role:Ols.ROLE_USER}, (err, member) => {
            if(err) {
                toastr.error('Unable to add member: ' + err.reason);
                console.error('Error adding member: ' + JSON.stringify(err, null, 2));
            } else {
                Ols.Message.systemSuccessMessage(this.props.projectId, Meteor.user().username + " added " + member.username + " to this project");
            }
        });
        ReactDOM.findDOMNode(this.refs.textInput).value = "";
    }
});
