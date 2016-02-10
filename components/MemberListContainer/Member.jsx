Member = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        return {
            userProfileImage: Meteor.users.findOne(this.props.member.userId).profileImage
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
            <li onClick={this.onClick} className="member">
                <img style={this.styles.profileImage} src={this.data.userProfileImage}/>
                <div style={{paddingLeft: '50px'}}>{this.props.member.username}</div>
            </li>
        )
    },

    onClick: function() {
        this.props.onClick(this.props.member);
    }
});
