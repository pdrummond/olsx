if(Meteor.isClient) {
    Meteor.startup(function () {
        var permissionLevel = notify.permissionLevel();
        console.log("Desktop Notifications: " + permissionLevel);
        if (permissionLevel == notify.PERMISSION_DEFAULT) {
            notify.requestPermission();
        }
        notify.config({pageVisibility: false, autoClose: 5000});
    });


    Streamy.on('member-added', function(ctx) {
        console.log("MEMBER-ADDED STREAMY RECEIVED");
        notify.createNotification("New Conversation", {
            icon: 'https://www.openloopz.com/images/openloopz-o.png',
            body: ctx.member.createdByName + " has added you to a conversation called '" + ctx.conversation.subject + "'",
            tag: ctx.member._id
        });
    });
}