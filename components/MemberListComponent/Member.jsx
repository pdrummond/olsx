Member = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            isSelected: false
        }
    },

    getProjectTypeLabel: function() {
        if(this.props.showMembersOnly) {
            return 'conversation';
        } else {
            return 'project';
        }
    },

    getMeteorData() {
        var user = Meteor.users.findOne(this.props.member.userId);
        var data = {};
        data.userProfileImage = user.profileImage;
        data.userStatus = user.status && user.status.online
                ? user.currentProjectId && user.currentProjectId == this.props.member.projectId
                    ? 'viewing' : 'online'
                : 'offline';
        switch(data.userStatus) {
            case 'viewing': data.userStatusLabel = 'Viewing this ' + this.getProjectTypeLabel(); break;
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
            top: '3px'
        }
    },

    getRoleLabelClassName() {
        if(this.props.member.role == Ols.Role.ROLE_ADMIN) {
            return "label label-success pull-right";
        } else {
            return "label label-warning pull-right";
        }
    },

    render() {
        return (
            <li className={this.state.isSelected?'member active':'member'}>
                <img style={this.styles.profileImage} src={this.data.userProfileImage}/>
                <div style={{paddingLeft: '50px'}}>
                    <div onClick={this.onTitleClicked} className="member-title">{this.props.member.username} <span className={this.getRoleLabelClassName()}>{this.props.member.role == Ols.Role.ROLE_ADMIN ? 'ADMIN':'USER'}</span></div>
                    <div style={{fontSize:'12px',fontWeight:'bold'}} className={this.data.userStatus}>{this.data.userStatusLabel}</div>
                </div>
                {this.renderSelectedLinks()}
            </li>
        )
    },

    renderSelectedLinks() {
        if(this.state.isSelected) {
            return (
                <div style={{paddingLeft:'45px',marginTop:'10px'}}>
                    <div className="btn-group" role="group" aria-label="...">
                        <button type="button" className="btn btn-xs btn-link"><i className="fa fa-user"></i> User Profile</button>
                    </div>
                    <div className="pull-right">
                        <div className="dropdown">
                            <button className="btn btn-default btn-xs dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                <i className="fa fa-ellipsis-v"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu1">
                                <li><a onClick={this.onRemoveLinkClicked} href="">Remove Member</a></li>
                                <li role="separator" className="divider"></li>
                                {this.renderRoleMenuItem()}
                            </ul>
                        </div>
                    </div>

                </div>
            );
        } else {
            return <div></div>
        }
    },

    renderRoleMenuItem() {
        if(this.props.member.role == Ols.Role.ROLE_ADMIN) {
            return <li><a onClick={this.onUserLinkClicked} href="">Demote to USER </a></li>;
        } else {
            return <li><a onClick={this.onAdminLinkClicked} href="">Promote to ADMIN </a></li>;
        }
    },

    onTitleClicked: function(e) {
        e.preventDefault();
        this.setState({'isSelected': !this.state.isSelected});
    },

    onRemoveLinkClicked(e) {
        e.preventDefault();
        var self = this;
        bootbox.confirm("Do you wish to remove this member from the project?", function(result) {
            if(result == true) {
                Members.methods.removeMember.call({memberId: self.props.member._id}, (err) => {
                    if (err) {
                        toastr.error('Unable to remove member: ' + err.reason);
                    }
                });
            }
        });
    },

    onAdminLinkClicked(e) {
        e.preventDefault();
        var self = this;
        bootbox.confirm("Are you sure you want to give this member ADMIN rights to this project?", function(result) {
            if(result == true) {
                Members.methods.setRole.call({memberId: self.props.member._id, role:Ols.Role.ROLE_ADMIN}, (err) => {
                    if (err) {
                        toastr.error('Unable to promote member to admin: ' + err.reason);
                    }
                });
            }
        });
    },

    onUserLinkClicked(e) {
        e.preventDefault();
        var self = this;
        bootbox.confirm("Are you sure you want to remove ADMIN rights from this member?", function(result) {
            if(result == true) {
                Members.methods.setRole.call({memberId: self.props.member._id, role:Ols.Role.ROLE_USER}, (err) => {
                    if (err) {
                        toastr.error('Unable to demote member to user: ' + err.reason);
                    }
                });
            }
        });
    }
});
