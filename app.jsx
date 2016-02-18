
if(Meteor.isServer) {

    Meteor.startup(function() {
        console.log('OpenLoops is booting..');
        var resetTestProject = false;
        if(resetTestProject) {
            Counters.remove({});
            ServerMessages.remove({});
            Projects.remove({});

            var now = new Date();
            Projects.insert({
                _id: '1',
                title: 'Test Project',
                createdAt: now,
                updatedAt: now,
                createdBy: 'pdrummond',
                updatedBy: 'pdrummond',
                createdByName: 'pdrummond',
                updatedByName: 'pdrummond'
            });

            for (let i = 1; i <= 5000; i++) {
                Meteor.call('saveMessage', {
                    projectId: '1',
                    createdBy: 'pdrummond',
                    updatedBy: 'pdrummond',
                    createdByName: 'pdrummond',
                    updatedByName: 'pdrummond',
                    createdAt: now,
                    updatedAt: now,
                    content: 'Message ' + i
                });
                now.setSeconds(now.getSeconds() + 1);
            }
            console.log("Test Project reset. " + ServerMessages.find().count() + " test messages added.");
        } else {
            console.log('OpenLoops booted - total message count is ' + ServerMessages.find().count() + '.');
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