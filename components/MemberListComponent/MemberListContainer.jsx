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
        if(currentMember.role == Ols.ROLE_ADMIN) {
            if(confirm("Do you wish to remove this member from the conversation?")) {
                Members.methods.removeMember.call({memberId: memberToRemove._id}, (err) => {
                    if (err) {
                        toastr.error('Unable to remove member: ' + err.reason);
                    } else {
                        Ols.Message.systemSuccessMessage(this.props.conversationId, Meteor.user().username + " removed " + memberToRemove.username + " from this conversation");
                    }
                });
            }
        }
    },

    handleSubmit(event) {
        event.preventDefault();
        var emailOrUsername = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

        Members.methods.addMember.call({emailOrUsername, conversationId: this.props.conversationId, role:Ols.ROLE_USER}, (err, member) => {
            if(err) {
                toastr.error('Unable to add member: ' + err.reason);
                console.error('Error adding member: ' + JSON.stringify(err, null, 2));
            } else {
                Ols.Message.systemSuccessMessage(this.props.conversationId, Meteor.user().username + " added " + member.username + " to this conversation");
            }
        });
        ReactDOM.findDOMNode(this.refs.textInput).value = "";
    }
});
