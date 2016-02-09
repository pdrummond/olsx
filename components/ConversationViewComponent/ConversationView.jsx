ConversationView = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        console.log("getMeteorData()");
        var data = {};
        var currentConversationId = FlowRouter.getParam('conversationId');
        var currentConversationHandle = Meteor.subscribe('currentConversation', currentConversationId);
        var membersHandle = Meteor.subscribe('currentConversationMembers', currentConversationId);
        data.isLoading = true;
        if(membersHandle.ready() && currentConversationHandle.ready()) {
            data.authInProcess = Meteor.loggingIn();
            data.canShow = Meteor.user() != null && Members.findOne({userId: Meteor.userId()}) != null;

            data.currentConversation = Conversations.findOne(currentConversationId);
            data.membersList = Members.find({conversationId: currentConversationId}, {sort: {createdAt: 1}}).fetch();

            data.startMessageSeq = parseInt(FlowRouter.getParam('startMessageSeq')) || 0;
            data.messagesCountLimit = parseInt(FlowRouter.getParam('messagesCountLimit')) || 30;
            data.doScrollBottom = FlowRouter.getQueryParam('scrollBottom') != null;
            data.isLoading = false;
        }
        return data;
    },

    render() {
        if(this.data.isLoading) {
           return (
               <p>Loading..</p>
           );
        } else if(this.data.canShow == false) {
            return (
                <div className="container">
                    <div className="empty-conversation-list">
                        <p><b>Computer says no!</b></p>
                        <div><i className="fa fa-frown-o" style={{'fontSize':'20em', 'color': '#703470'}}></i></div>
                        <p>Sorry, you aren't a member of this conversation</p>
                    </div>
                </div>
            );
        } else if (this.data.currentConversation) {
            return (
                <div className="container">
                    <MemberListContainer conversationId={this.data.currentConversation._id} memberList={this.data.membersList}/>
                    <header>
                        <h2>{this.data.currentConversation.subject}</h2>
                        <div style={{float:'right', position: 'relative', top: '-25px'}}>
                            <a style={{color:'gray', textDecoration:'none'}} onClick={this.onDeleteLinkClicked} href=""><i
                                className="fa fa-trash"></i> Delete</a>
                        </div>
                    </header>
                    <MessageListContainer
                        ref="messageListContainer"
                        conversationId={this.data.currentConversation._id}
                        startMessageSeq={this.data.startMessageSeq}
                        messagesCountLimit={this.data.messagesCountLimit}/>
                </div>
            );
        } else {
            return (
                <div className="container">
                    <div className="empty-conversation-list">
                        <p><b>Welcome to OpenLoops</b></p>
                        <div><i className="fa fa-comments-o" style={{'fontSize':'20em', 'color': '#703470'}}></i></div>
                        <p>Create or select a conversation to get started</p>
                    </div>
                </div>
            );
        }
    },

    componentDidMount: function () {
       // console.trace("ConversationPage.componentDidMount");
    },

    componentDidUpdate: function () {
        console.trace("ConversationPage.componentDidUpdate");
        if (this.data.canShow) {
            var self = this;
            if (this.data.currentConversation) {
                this.refs.messageListContainer.loadMessages(function () {
                    if (self.data.doScrollBottom) {
                        self.refs.messageListContainer.scrollBottom();
                    }
                });
            }
        }
    },

    onDeleteLinkClicked() {
        Conversations.methods.removeConversation.call({conversationId: this.data.currentConversation._id}, function (err) {
            if (err) {
                toastr.error("Unable to delete conversation", err.reason);
            }
        });
    }
})