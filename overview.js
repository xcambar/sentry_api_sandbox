#!/usr/bin/env node
"use strict";

require('dotenv').load();

var url         = require('url');
var request     = require('./lib/request');
var transforms  = require('./lib/transforms');


var not     = transforms.not;
var mapper  = transforms.mapper;
var filter  = transforms.filter;
var reducer = transforms.reducer;


var groupId = process.env.EVENT_GROUP;
require('assert')(groupId, '[Missing parameter] The script requires a group of events');

// Utility functions
// and specific transforms

function numToPlaceholder(str) {
  if (str.match(/\d+/)) {
    return "__id__";
  }
  return str;
}

function normalizeURI(uri) {
  return (url.parse(uri).pathname || '/')
    .split('/')
    .filter(not(filter('length', 0)))
    .map(numToPlaceholder)
    .join('/');
}

function aggregate(stats, value) {
  stats[value] = (stats[value] || 0) + 1;
  return stats;
}

function uniq(v, idx, obj) {
  return obj.indexOf(v) === idx;
}

//
// START
//

request.conf({
  key: process.env.SENTRY_KEY,
  organization: process.env.SENTRY_ORGANIZATION,
  project: process.env.SENTRY_PROJECT
});

request.events(groupId).then(function (events) {

  var statuses = events
    .map(mapper('context.reason.status'))
    .filter(uniq);

  statuses.forEach(function (status) {
    var reqs = events
      .filter(filter('context.reason.status', status))
      .map(mapper('entries'))
      .reduce(reducer('concat'), [])
      .map(mapper('data.fragment'))
      .map(normalizeURI);
    console.log(reqs.length, "requests failed with status", status);

    var perURL = reqs.reduce(aggregate, {});
    console.log(JSON.stringify(perURL, null, 2));
    console.log(); // new line
  });

}).catch(function (err) {
  console.error(err.message, err.stack);
});
