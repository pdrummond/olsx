Refs.schema = new SimpleSchema({
    messageId: {type: String},
    projectId: {type: String},
    itemId:  {type: String},
    itemSeq: {type: Number},
    messageSeq: {type: Number},
    messageContent: {type:String, optional:true}, //Message content isn't required for activity/integration messages
    createdAt: {type: Date},
    updatedAt: {type: Date}
});

Refs.attachSchema(Refs.schema);

Refs.methods = {};
Refs.methods.addRef = new ValidatedMethod({
    name: 'Refs.methods.addRef',
    validate: new SimpleSchema({
        messageId: {type: String},
        projectId: {type: String},
        itemId:  {type: String},
        itemSeq: {type: Number},
        messageSeq: {type: Number},
        messageContent: {type:String, optional:true}
    }).validator(),

    run({messageId, projectId, itemId, itemSeq, messageSeq, messageContent}) {
        var now = Date();
        var ref = {
            createdAt: now,
            updatedAt: now,
            messageId:messageId,
            projectId: projectId,
            itemId: itemId,
            itemSeq: itemSeq,
            messageSeq:messageSeq,
            messageContent:messageContent
        };

        var refId = Refs.insert(ref);
        ref._id = refId;
        return ref;
    }
});
