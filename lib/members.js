
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
            throw new Meteor.Error("Members.methods.addMember.not-authorized");
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
            role: Ols.ROLE_USER,
            createdAt: now,
            updatedAt: now,
            createdBy: Meteor.userId(),
            updatedBy: Meteor.userId(),
            createdByName: Meteor.user().username,
            updatedByName: Meteor.user().username
        };

        var memberId = Members.insert(member);
        member._id = memberId;

        //Inform the user of their new membership to a project
        Streamy.sessionsForUsers(member.userId).emit('member-added', {
            member: member,
            project: Projects.findOne(projectId)
        });

        return member;
    },
});

Members.methods.removeMember = new ValidatedMethod({
    name: 'Members.methods.removeMember',
    validate: new SimpleSchema({
        memberId: {type: String},
    }).validator(),

    run({memberId}) {
        if (!this.userId) {
            throw new Meteor.Error("Members.methods.removeMember.not-authorized");
        }
        var memberToRemove = Members.findOne(memberId);
        if(memberToRemove == null) {
            throw new Meteor.Error("Members.methods.removeMember.not-exists");
        }

        if(memberToRemove.role == Ols.Role.ROLE_ADMIN) {
            var numAdmins = Members.find({role:Ols.Role.ROLE_ADMIN}).count();
            if(numAdmins == 1) {
               throw new Meteor.Error("Members.methods.removeMember.last-admin", "Project must have at least one admin");
            }
        }

        Members.remove(memberId);
    }
});
