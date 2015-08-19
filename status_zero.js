#!/usr/bin/env node
"use strict";

require('dotenv').load();

var get         = require('object-path').get;
var request     = require('./lib/request');
var transforms  = require('./lib/transforms');


var mapper  = transforms.mapper;
var filter  = transforms.filter;

var groupId = process.env.EVENT_GROUP;
require('assert')(groupId, '[Missing parameter] The script requires a group of events');


function aggregate(stats, value) {
  stats[value] = (stats[value] || 0) + 1;
  return stats;
}

function dateSorter (a, b) {
  var left = Date.parse(a.dateCreated);
  var right = Date.parse(b.dateCreated);
  if (left === right) return 0;
  if (left <= right) return -1;
  if (left >= right) return 1;
}

function removeVersionNumberExceptIE(str) {
  if (str.match('IE')) { return str; }
  var split = str.split(' ');
  if (split.length < 2) { return str; }
  return split.slice(0, -1).join(' ');
}


//
// START
//

request.conf({
  key: process.env.SENTRY_KEY,
  organization: process.env.SENTRY_ORGANIZATION,
  project: process.env.SENTRY_PROJECT
});

Promise.all([
  request.releases(),
  request.events(groupId)
]).then(function (data) {

  var releases = data[0];

  var zeros = data[1]
    .filter(filter('context.reason.status', 0))
    .sort(dateSorter);

  //
  //LATEST EVENT WITH STATUS 0
  //
  var latestZero = zeros.pop();
  console.log(
    'Last seen in version',
    get(latestZero, 'tags.sentry:release'),
    'on',
    get(latestZero, 'dateCreated'),
    'with browser',
    get(latestZero, 'tags.browser')
  );
  console.log(/* new line */);


  //
  // STATS PER RELEASE
  //
  var occurencesByRelease = zeros
    .map(mapper('tags.sentry:release'))
    .reduce(aggregate, {});

  var releaseStats = releases
  .sort(dateSorter)
  .reduce(function (memo, rel) {
    memo[rel.version] = occurencesByRelease[rel.version] || 0;
    return memo;
  }, {});

  console.log('Stats per release, sorted by release date:');
  console.log(JSON.stringify(releaseStats, null, 2));
  console.log(/* new line */);

  //
  // STATS PER BROWSER
  //
  var occurencesByBrowser = zeros
    .map(mapper('tags.browser'))
    .map(removeVersionNumberExceptIE)
    .reduce(aggregate, {});

  console.log('Stats per browser:');
  console.log(JSON.stringify(occurencesByBrowser, null, 2));

}).catch(function (err) {
  console.log(err.stack);
});
