Apps = new Mongo.Collection('apps');
Invites = new Mongo.Collection('invites');
Videos = new Mongo.Collection('videos');
Analytics = new Mongo.Collection('analytics');

// Background jobs collections.
ChanJobs = JobCollection('chan');

// Configure timestamps fields for collections using 'zimme:collection-timestampable' package..
Analytics.attachBehaviour('timestampable',{
  createdBy: false,
  updatedBy: false
});
