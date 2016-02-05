
if(Meteor.isServer) {

    Meteor.startup(function() {
        //ServerMessages.remove({});
        if(ServerMessages.find().count() == 0) {
            for(let i=0; i<5000; i++) {
                ServerMessages.insert({
                    createdBy: 'pdrummond',
                    createdAt: new Date().getTime() + i,
                    content: 'Message ' + i
                });
            }
        }
    });
}


if(Meteor.isClient) {
    Accounts.ui.config({
        passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
    });
}

// Override Meteor._debug to filter for custom msgs - as used
// by yuukan:streamy (https://goo.gl/4HQiKg)
Meteor._debug = (function (super_meteor_debug) {
    return function (error, info) {
        if (!(info && _.has(info, 'msg')))
            super_meteor_debug(error, info);
    }
})(Meteor._debug);