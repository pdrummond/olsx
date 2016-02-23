
Members.schema = new SimpleSchema([BaseSchema, {
    userId: {type: String},
    username: {type: String},
    projectId: {type: String},
    role: {type: String}
}]);

Members.attachSchema(Members.schema);

Members.methods = {};
Members.methods.addMember = new ValidatedMethod({
    name: 'Members.methods.addMember',
    validate: new SimpleSchema({
        emailOrUsername: {type: String},
        projectId: {type: String},
        role: {type: String}
    }).validator(),
    run({emailOrUsername, projectId, role}) {
        if (!this.userId) {
            throw new Meteor.Error("Members.methods.addMember.not-authenticated");
        }
        if(Members.findOne({userId: Meteor.userId(), projectId, role:Ols.Role.ROLE_ADMIN}) == null) {
            throw new Meteor.Error("Projects.methods.addMember.not-authorised", "Only project admins can add members to this project");
        }

        var user;
        if(emailOrUsername.indexOf('@') != -1) {
            user = Meteor.users.findOne({'emails.address': emailOrUsername});
        } else {
            user = Meteor.users.findOne({username: emailOrUsername});
        }
        console.log(">> user is " + JSON.stringify(user));
        if(user == null) {
            throw new Meteor.Error("Members.methods.addMember.user-not-found", "Cannot find user with username/email of " + emailOrUsername);
        }

        var now = new Date();
        var member = {
            userId: user._id,
            username: user.username,
            projectId: projectId,
            role: Ols.Role.ROLE_USER,
            createdAt: now,
            updatedAt: now,
            createdBy: Meteor.userId(),
            updatedBy: Meteor.userId(),
            createdByName: Meteor.user().username,
            updatedByName: Meteor.user().username
        };

        var memberId = Members.insert(member);
        member._id = memberId;

        var sysMsg = Ols.Message.systemSuccessMessage(projectId, Meteor.user().username + " added " + member.username + " to this project");
        if(Meteor.isServer) {
            Meteor.call('addActivityMessage', (Meteor.user().username + Meteor.user().username + " added " + member.username + " to this project"), projectId, sysMsg._id, sysMsg.seq, projectId);
        }

        //Inform the user of their new membership to a project
        Streamy.sessionsForUsers(member.userId).emit('member-added', {
            member: member,
            project: Projects.findOne(projectId)
        });

        return member;
    }
});

Members.methods.removeMember = new ValidatedMethod({
    name: 'Members.methods.removeMember',
    validate: new SimpleSchema({
        memberId: {type: String}
    }).validator(),

    run({memberId}) {
        if (!this.userId) {
            throw new Meteor.Error("Members.methods.removeMember.not-authenticated");
        }

        var member = Members.findOne(memberId);
        if(member == null) {
            throw new Meteor.Error("Members.methods.removeMember.not-exists");
        }

        if(Members.findOne({userId: Meteor.userId(), projectId:member.projectId, role:Ols.Role.ROLE_ADMIN}) == null) {
            throw new Meteor.Error("Projects.methods.removeMember.not-authorised", "Only project admins can remove members from this project");
        }


        if(member.role == Ols.Role.ROLE_ADMIN) {
            var numAdmins = Members.find({role:Ols.Role.ROLE_ADMIN}).count();
            if(numAdmins == 1) {
               throw new Meteor.Error("Members.methods.removeMember.last-admin", "Project must have at least one admin");
            }
        }

        Members.remove(memberId);
        var sysMsg = Ols.Message.systemSuccessMessage(member.projectId, Meteor.user().username + " removed " + member.username + " from this project");
        if(Meteor.isServer) {
            Meteor.call('addActivityMessage', (Meteor.user().username + " removed " + member.username + " from this project"), member.projectId, sysMsg._id, sysMsg.seq, member.projectId);
        }
    }
});

Members.methods.setRole = new ValidatedMethod({
    name: 'Members.methods.setRole',

    validate: new SimpleSchema({
        memberId: {type: String},
        role: {type: String}
    }).validator(),

    run({memberId, role}) {
        if (!this.userId) {
            throw new Meteor.Error("Members.methods.setRole.not-authenticated");
        }
        var member = Members.findOne(memberId);

        if(Members.findOne({userId: Meteor.userId(), projectId: member.projectId, role:Ols.Role.ROLE_ADMIN}) == null) {
            throw new Meteor.Error("Members.methods.setRole.not-authorised", "Only member admins can change member roles");
        }

        Members.update(memberId, {
            $set: {role: role, updatedAt: new Date()}
        });
        if(role == Ols.Role.ROLE_ADMIN) {
            var sysMsg = Ols.Message.systemSuccessMessage(member.projectId, Meteor.user().username + " gave admin access to " + member.username);
            if (Meteor.isServer) {
                Meteor.call('addActivityMessage', (Meteor.user().username + " gave admin access to " + member.username), member.projectId, sysMsg._id, sysMsg.seq, memberId);
            }
        } else {
            var sysMsg = Ols.Message.systemSuccessMessage(member.projectId, Meteor.user().username + " revoked admin access from " + member.username);
            if (Meteor.isServer) {
                Meteor.call('addActivityMessage', (Meteor.user().username + " revoked admin access from " + member.username), member.projectId, sysMsg._id, sysMsg.seq, memberId);
            }
        }
    }
});



