if(Meteor.isServer) {
    ServerMessages = new Meteor.Collection('messages');
}
if(Meteor.isClient) {
    ClientMessages = new Meteor.Collection(null);
}
Conversations = new Mongo.Collection('conversations');
Counters = new Mongo.Collection('counters');
Members = new Mongo.Collection('members');
Projects = new Mongo.Collection('projects');
Refs = new Mongo.Collection('refs');
Tasks = new Mongo.Collection('tasks');

