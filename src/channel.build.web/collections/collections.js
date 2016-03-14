Apps = new Mongo.Collection('apps');
Invites = new Mongo.Collection('invites');
Videos = new Mongo.Collection('videos');

// Background jobs collections.
ChanJobs = JobCollection('chan');
