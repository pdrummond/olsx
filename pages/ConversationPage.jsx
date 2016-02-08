/*
 This component has two jobs.  Firstly, it manages the subscription
 to the current conversation for the page.  Secondly, it ensures
 messages are loaded when the page changes through componentDidUpdate().
 */
ConversationPage = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        var data = {};
        var currentConversationId = FlowRouter.getParam('conversationId');
        var handle = Meteor.subscribe('currentConversation', currentConversationId);
        if(handle.ready) {
            data.authInProcess = Meteor.loggingIn();
            data.canShow = !!Meteor.user();
            data.currentConversation = Conversations.findOne(currentConversationId);
            data.startMessageSeq = parseInt(FlowRouter.getParam('startMessageSeq')) || 0;
            data.messagesCountLimit = parseInt(FlowRouter.getParam('messagesCountLimit')) || 30;
            data.doScrollBottom = FlowRouter.getQueryParam('scrollBottom') != null;
        }
        return data;
    },

    noAuthMessage() {
        return <p>
            {"You are not authorized to view this page."}
        </p>;
    },

    getContent() {
        return <div className="full-height">
            {this.data.canShow? this.renderPage() : this.noAuthMessage() }
        </div>;
    },

    render() {
        return <div className="full-height">
            {this.data.authInProcess?  <p>Loading...</p> : this.getContent()}
        </div>;
    },

    renderPage() {
        if(this.data.currentConversation) {
            return (
                <div className="container">
                    <ConversationListContainer />
                    <header>
                        <h2>{this.data.currentConversation.subject}</h2>
                        <div style={{float:'right', position: 'relative', top: '-25px'}}>
                            <a style={{color:'gray', textDecoration:'none'}} onClick={this.onDeleteLinkClicked} href=""><i className="fa fa-trash"></i> Delete</a>
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
                    <ConversationListContainer />
                    <div className="empty-conversation-list">
                        <p><b>Welcome to OpenLoops</b></p>
                        <div><i className="fa fa-smile-o" style={{'fontSize':'20em'}}></i></div>
                        <p>Create or select a conversation to get started</p>
                    </div>
                </div>
            );
        }
    },

    componentDidMount: function() {
        console.trace("ConversationPage.componentDidMount");
    },

    componentDidUpdate: function() {
        console.trace("ConversationPage.componentDidUpdate");

        var self = this;
        if(this.data.currentConversation) {
            this.refs.messageListContainer.loadMessages(function() {
                if(self.data.doScrollBottom) {
                    self.refs.messageListContainer.scrollBottom();
                }
            });
        } else {
            console.log("SHOULD THIS EVER HAPPEN?");
        }
    },

    onDeleteLinkClicked() {
        Meteor.call('removeConversation', this.data.currentConversation._id, function(err) {
            if(err) {
                toastr.error("Unable to delete conversation", err.reason);
            }
        });
    }
});