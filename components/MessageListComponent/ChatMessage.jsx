ChatMessage = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        return {
            userProfileImage: Meteor.users.findOne(this.props.message.createdBy).profileImage
        };
    },

    styles: {
        profileImage: {
            float: 'left',
            width: '35px',
            borderRadius: '20px'
        }
    },

    render() {
        return (
            <li className='message-item'>
                <img style={this.styles.profileImage} src={this.data.userProfileImage}/>
                <div style={{paddingLeft:'50px'}}>
                    <div><b>{this.props.message.createdByName}</b>
                        <span
                            className="message-created-at"> {moment(this.props.message.createdAt).fromNow()} </span>
                    </div>
                    <div className="message-content" style={{marginTop: '5px'}}>{this.props.message.content}</div>
                </div>
            </li>
        );
    }
});