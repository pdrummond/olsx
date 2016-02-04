
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