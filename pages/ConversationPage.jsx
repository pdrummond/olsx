/*
 This component has two jobs.  Firstly, it manages the subscription
 to the current conversation for the page.  Secondly, it ensures
 messages are loaded when the page changes through componentDidUpdate().
 */
ConversationPage = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        console.log("ConversationPage.getMeteorData()");
        var data = {};
        var usersHandle = Meteor.subscribe('allUsernames');
        var conversationsHandle = Meteor.subscribe('conversations');
        if(conversationsHandle.ready() && usersHandle.ready()) {
            data.conversationList = Conversations.find({}, {sort: {updatedAt: -1}}).fetch();
            data.authInProcess = Meteor.loggingIn();
            data.currentConversationId = FlowRouter.getParam('conversationId');
        }
        return data;
    },

    render() {
        if(this.data.authInProcess) {
            return (
                <p>Loading...</p>
            );
        } else if(Meteor.userId() == null) {
           return (
               <div className="container">
                   <div className="empty-conversation-list">
                       <p><b>Welcome to OpenLoops</b></p>
                       <div><i className="fa fa-adjust" style={{'fontSize':'20em', 'color': '#703470'}}></i></div>
                       <p>Please login or sign-up to continue</p>
                   </div>
               </div>
           );
        } else {
            return (
                <div className="container">
                    <ConversationListContainer
                        currentConversationId={this.data.currentConversationId}
                        conversationList={this.data.conversationList}/>
                    <ConversationView/>
                </div>
            );

        }
    },

});