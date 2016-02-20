if(Meteor.isServer) {
    ServerMessages = new Meteor.Collection('messages');
}
if(Meteor.isClient) {
    ClientMessages = new Meteor.Collection(null);
}

Releases = new Mongo.Collection('releases');
Milestones = new Mongo.Collection('milestones');
Projects = new Mongo.Collection('projects');
Items = new Mongo.Collection('items');
Refs = new Mongo.Collection('refs');

Members = new Mongo.Collection('members');
Counters = new Mongo.Collection('counters');

if(Meteor.isClient) {
    MilestoneTaskCounts = new Mongo.Collection("milestone-task-counts");
    ProjectActionCounts= new Mongo.Collection("project-action-counts");
}
