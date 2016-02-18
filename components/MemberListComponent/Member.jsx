Member = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        var user = Meteor.users.findOne(this.props.member.userId);
        var data = {};
        data.userProfileImage = user.profileImage;
        data.userStatus = user.status && user.status.online
                ? user.currentProjectId && user.currentProjectId == this.props.member.projectId
                    ? 'viewing' : 'online'
                : 'offline';
        switch(data.userStatus) {
            case 'viewing': data.userStatusLabel = 'Viewing this project'; break;
            case 'online': data.userStatusLabel = 'Online, elsewhere'; break;
            case 'offline': data.userStatusLabel = 'Offline'; break;
        }

        return data;
    },

    styles: {
        profileImage: {
            float: 'left',
            width: '35px',
            borderRadius: '20px',
            position: 'relative',
            top: '8px'
        }
    },

    render() {
        return (
            <li onClick={this.onClick} className="member">
                <img style={this.styles.profileImage} src={this.data.userProfileImage}/>
                <div style={{paddingLeft: '50px'}}>
                    <div>{this.props.member.username}</div>
                    <div style={{fontSize:'12px',fontWeight:'bold'}} className={this.data.userStatus}>{this.data.userStatusLabel}</div>
                </div>
            </li>
        )
    },


    onClick: function() {
        this.props.onClick(this.props.member);
    }
});
