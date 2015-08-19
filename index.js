#!/usr/bin/env node
"use strict";

var glob    = require('glob');
var not     = require('./lib/transforms').not;
var filter  = require('./lib/transforms').filter;

glob('*.js', function (err, files) {
  if (err) {
    console.error("An error occured:");
    return console.error(err);
  }
  console.log('The available scripts are:');
  files
    .filter(not(filter('index.js')))
    .forEach(function (filename) {
      console.log('*', filename);
    });
});
