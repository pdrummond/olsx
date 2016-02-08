Tasks = new Mongo.Collection('tasks');

Tasks.schema = new SimpleSchema([BaseSchema, {
   description: {type: String},
   status: {type: String},
   seq: {type: Number},
   key: {type: String},
   messageId: {type: String},
   conversationId: {type: String},
   projectId: {type:String},
   projectType: {type:String}
}]);

Tasks.attachSchema(Tasks.schema);
