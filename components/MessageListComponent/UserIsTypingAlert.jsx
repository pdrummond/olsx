UserIsTypingAlert = React.createClass({

    propTypes: {
        conversationId: React.PropTypes.string
    },


    getInitialState() {
        return {
            userIsTypingMsg: '',
        }
    },

    componentDidMount() {
        var self = this;
        console.log("UserIsTypingAlert.componentDidMount");
        Streamy.on('userIsTyping', function(ctx) {
            if(ctx.userId != Meteor.userId()) {
                if(ctx.conversationId == self.props.conversationId) {
                    self.setState({'userIsTypingMsg': ctx.username + " is typing.."});
                    clearInterval(self.userIsTypingTimeout);
                    self.userIsTypingTimeout = setTimeout(function() {
                        self.setState({'userIsTypingMsg': ''});
                    }, 2000);
                }
            }
        });
    },

    render() {
        return (
            <div style={{height:'10px'}} className='user-is-typing'>{this.state.userIsTypingMsg}</div>
        );
    }
});