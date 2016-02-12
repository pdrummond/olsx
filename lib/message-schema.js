SimpleSchema.debug = true

Messages = {
    schema: new SimpleSchema([BaseSchema, {
        seq: {type: Number, optional:true},
        conversationId: {type: String},
        messageType: {type:String},
        content: {type:String, optional:true},
        customMessageType: {type:String, optional:true},
        isCommand: {type:Boolean, optional:true},
        isSystem: {type:Boolean, optional:true},
        isError: {type:Boolean, optional:true},
        isSuccess: {type:Boolean, optional:true},
        tasks: {type: [Object], blackbox:true, optional:true},
        refs: {type: [Object], blackbox:true, optional:true}
    }])
};

if(Meteor.isClient) {
    ClientMessages.attachSchema(Messages.schema);
}

if(Meteor.isServer) {
    ServerMessages.attachSchema(Messages.schema);
}
