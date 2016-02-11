ConversationView = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        console.log("getMeteorData()");
        var data = {};
        data.currentConversation = {};
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
            data.messagesCountLimit = parseInt(FlowRouter.getParam('messagesCountLimit')) || Ols.DEFAULT_PAGE_SIZE;
            data.doScrollBottom = FlowRouter.getQueryParam('scrollBottom') != null;
            data.isLoading = false;
        }
        return data;
    },

    render() {
        if(this.data.canShow == false) {
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
                        <h2><i className="fa fa-comments-o"></i> {this.data.currentConversation.subject}</h2>
                        <div className="header-buttons">
                            <a style={{color:'white;font-size:12px', textDecoration:'none'}} onClick={this.onDeleteLinkClicked} href=""><i
                                className="fa fa-trash"></i> Delete</a>
                        </div>
                    </header>
                    <MessageListContainer
                        ref="messageListContainer"
                        conversationId={this.data.currentConversation._id}
                        startMessageSeq={this.data.startMessageSeq}
                        messagesCountLimit={this.data.messagesCountLimit}
                        onOtherConversationNewMessage={this.props.onOtherConversationNewMessage} />
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