Apps = new Mongo.Collection('apps');
Invites = new Mongo.Collection('invites');
Videos = new Mongo.Collection('videos');
Analytics = new Mongo.Collection('analytics');

// Background jobs collections.
ChanJobs = JobCollection('chan');

// Configure timestamps fields for collections using 'zimme:collection-timestampable' package..
Analytics.attachBehaviour('timestampable',{
  createdBy: false,
  updatedBy: false,
  updatedAt: false
});

// Define schemas for collections.
var Schemas = {};
Schemas.Analytic = new SimpleSchema({
  appId: {
    type: String,
    label: 'Application ID'
  },
  deviceId: {
    type: String,
    label: 'Device ID'
  },
  operation: {
    type: String,
    label: 'Operation'
  },
  target: {
    type: String,
    label: 'Target ID',
    optional: true
  }
});

Analytics.attachSchema(Schemas.Analytic);
