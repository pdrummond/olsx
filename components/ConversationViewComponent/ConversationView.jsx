ConversationView = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        console.log("getMeteorData()");
        var data = {};
        data.currentConversation = {};
        data.currentConversationId = FlowRouter.getParam('conversationId');
        var currentConversationHandle = Meteor.subscribe('currentConversation', data.currentConversationId);
        var membersHandle = Meteor.subscribe('currentConversationMembers', data.currentConversationId);
        data.isLoading = true;
        if(membersHandle.ready() && currentConversationHandle.ready()) {
            data.authInProcess = Meteor.loggingIn();
            data.canShow = Meteor.user() != null && Members.findOne({userId: Meteor.userId()}) != null;

            data.currentConversation = Conversations.findOne(data.currentConversationId);
            data.memberList = Members.find({conversationId: data.currentConversationId}, {sort: {createdAt: 1}}).fetch();

            data.startMessageSeq = parseInt(FlowRouter.getParam('startMessageSeq')) || 0;
            data.messagesCountLimit = parseInt(FlowRouter.getParam('messagesCountLimit')) || Ols.DEFAULT_PAGE_SIZE;
            data.doScrollBottom = FlowRouter.getQueryParam('scrollBottom') != null;
            data.doScrollTop = FlowRouter.getQueryParam('scrollTop') != null;
            data.isLoading = false;
        }
        return data;
    },

    render() {
        if (this.data.currentConversationId == null) {
            return (
                <div className="view-container">
                    <div className="empty-conversation-list">
                        <p><b>Welcome to OpenLoops!</b></p>
                        <div><i className="fa fa-smile-o" style={{'fontSize':'20em', 'color': '#FF7503'}}></i></div>
                        <p>To get started, either create a new conversation or select an existing one.</p>
                    </div>
                </div>
            );
        } else if(this.data.canShow == false) {
            return (
                <div className="view-container">
                    <div className="empty-conversation-list">
                        <p><b>Computer says no!</b></p>
                        <div><i className="fa fa-frown-o" style={{'fontSize':'20em', 'color': '#703470'}}></i></div>
                        <p>Sorry, you aren't a member of this conversation</p>
                    </div>
                </div>
            );
        } else if (this.data.currentConversation) {
            return (
                <div className="view-container">
                    <RightSidebarComponent
                        conversationId={this.data.currentConversation._id}
                        memberList={this.data.memberList}
                    />
                    {this.renderHeader()}
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

    renderHeader() {
        if(this.isLoading) {
            return (
            <header>
                <h2>
                    <i className="fa fa-spin fa-2x fa-spinner" style={{color:'#01588A', position:'relative', top:'-10px'}}></i>
                </h2>
            </header>
            );
        } else {
            return(
                <header>
                    <h2><i className="fa fa-bullseye"></i> {this.data.currentConversation.subject}</h2>
                    <div className="header-buttons">
                        <a style={{color:'white;font-size:12px', textDecoration:'none'}} onClick={this.onDeleteLinkClicked} href="">
                            <i className="fa fa-trash"></i> Delete
                        </a>
                    </div>
                </header>
            );
        }
    },

    onDeleteLinkClicked: function() {
        this.props.onDeleteLinkClicked(this.data.currentConversationId);
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
                    } else if(self.data.doScrollTop) {
                        self.refs.messageListContainer.scrollTop();
                    }
                });
            }
        }
    }
})