if(Meteor.isServer) {
    ServerMessages = new Meteor.Collection('messages');
}
if(Meteor.isClient) {
    ClientMessages = new Meteor.Collection(null);
}
Projects = new Mongo.Collection('projects');
Counters = new Mongo.Collection('counters');
Members = new Mongo.Collection('members');
Refs = new Mongo.Collection('refs');
Items = new Mongo.Collection('items');

