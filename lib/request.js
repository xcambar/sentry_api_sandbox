"use strict";

var url       = require('url');
var get       = require('object-path').get;
var fetch     = require('node-fetch');
var assert    = require('assert');
var parseLink = require('parse-link-header');

var SENTRY_API = "https://beta.getsentry.com/api/0";
var config = {
  key: null,
  organization: null,
  project: null
};

var exposed = {
  conf: function (conf) {
    Object.keys(conf).forEach(function (k) {
      config[k] = conf[k];
    });
    return config;
  },
  events: function (groupId) {
    assert(groupId, '[API Configuration] No Group specified');
    var uri = [SENTRY_API, 'groups', groupId, 'events', ''].join('/'); // Final "/" mandatory
    return fetchCollection(uri);
  },
  releases: function () {
    assert(config.organization, '[API Configuration] No Sentry Organization specified');
    assert(config.project, '[API Configuration] No Sentry Project specified');
    var uri = [SENTRY_API, 'projects', config.organization, config.project, 'releases', ''].join('/'); // Final "/" mandatory
    return fetchCollection(uri);
  }
};

function fetchCollection (uri) {
  return fetchPage(uri).then(appendNextPage);
  return fetchPage(uri).then(function (d) { return d.data; });
}

function nextPage(str) {
  var next = get(parseLink(str), 'next', {});
  return JSON.parse(next.results) === true ? next.url : undefined;
}

function buildCursor(resp) {
  var next = nextPage(resp.headers.get('Link'));
  return resp.json().then(function (jsonData) {
    return {
      data: jsonData,
      next: next
    };
  });
}

function fetchPage(baseUrl) {
  var parsed = url.parse(baseUrl);
  assert(config.key, '[API Configuration] No API key provided');
  parsed.auth = config.key;
  return fetch(url.format(parsed)).then(buildCursor);
}

function appendNextPage(cursor) {
  var events = cursor.data;
  var next = cursor.next;
  if (next) {
    return fetchCollection(next)
      .then(events.concat.bind(events));
  } else {
    return events;
  }
}

module.exports = exposed;
