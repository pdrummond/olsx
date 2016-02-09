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

    onMemberClicked(member) {
        alert("Member clicked: " + JSON.stringify(member));
    },

    handleSubmit(event) {
        event.preventDefault();
        var emailOrUsername = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

        Members.methods.addMember.call({emailOrUsername, conversationId: this.props.conversationId, role:Ols.ROLE_USER}, (err) => {
            if(err) {
                toastr.error('Oops! Something went wrong adding member - please try again.');
                console.error('Error adding member: ' + JSON.stringify(err, null, 2));
            }
        });
        ReactDOM.findDOMNode(this.refs.textInput).value = "";
    }
});
