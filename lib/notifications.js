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

    Streamy.on('mention', function(data) {
        console.log(">>> RECEIVED MENTION STREAMY");
        //TODO: Once mention uses direct message we won't have to
        //check for the user id.
        if(Meteor.userId() == data.toUserId) {
            var body = data.messageContent;
            //notify.createNotification("Mentioned", {body: data.messageId});
            notify.createNotification("@" + data.fromUsername + " mentioned you", {
                icon: 'https://www.openloopz.com/images/openloopz-o.png',
                body: body,
                tag: data.messageId
            });
            console.log("Mention notification created")
        }
    });
}