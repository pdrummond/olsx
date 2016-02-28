SimpleSchema.debug = true;

Messages = {
    schema: new SimpleSchema([BaseSchema, {
        seq: {type: Number, optional:true},
        projectId: {type: String},
        messageType: {type:String},
        messageSubType: {type:String, optional:true},
        content: {type:String, optional:true},
        customMessageType: {type:String, optional:true},
        isCommand: {type:Boolean, optional:true},
        isIntegration: {type:Boolean, optional:true},
        isSystem: {type:Boolean, optional:true},
        isError: {type:Boolean, optional:true},
        isSuccess: {type:Boolean, optional:true},
        isDeleted: {type:Boolean, optional:true},
        isEdited: {type:Boolean, optional:true},
        itemId: {type:String, optional:true},
        data: {type: Object, blackbox:true, optional:true}
    }])
};

if(Meteor.isClient) {
    ClientMessages.attachSchema(Messages.schema);
}

if(Meteor.isServer) {
    ServerMessages.attachSchema(Messages.schema);
}
