Refs.schema = new SimpleSchema([BaseSchema, {
    messageId: {type: String},
    taskId:  {type: String},
    taskKey: {type: Number},
    messageSeq: {type: Number},
    messageContent: {type:String}
}]);

Refs.attachSchema(Refs.schema);

Refs.methods = {};
Refs.methods.addRef = new ValidatedMethod({
    name: 'Refs.methods.addRef',
    validate: new SimpleSchema({
        messageId: {type: String},
        taskId:  {type: String},
        taskKey: {type: Number},
        messageSeq: {type: Number},
        messageContent: {type:String}
    }).validator(),

    run({messageId, taskId, taskKey, messageSeq, messageContent}) {
        var now = Date();
        var ref = {
            createdAt: now,
            updatedAt: now,
            createdBy: Meteor.userId(),
            createdByName: Meteor.user().username,
            updatedBy: Meteor.userId(),
            updatedByName: Meteor.user().username,
            messageId:messageId,
            taskId:taskId,
            taskKey:taskKey,
            messageSeq:messageSeq,
            messageContent:messageContent
        };

        var refId = Refs.insert(ref);
        ref._id = refId;
        return ref;
    }
});