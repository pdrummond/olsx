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
Milestones = new Mongo.Collection('milestones');

if(Meteor.isClient) {
    MilestoneTaskCounts = new Mongo.Collection("milestone-task-counts");
    ProjectActionCounts= new Mongo.Collection("project-action-counts");
}
