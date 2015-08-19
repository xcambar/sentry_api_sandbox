"use strict";

var get = require('object-path').get;

function not(fn) {
  return function () {
    return !fn.apply(this, arguments);
  };
}

function reducer(fname) {
  return function (arr, obj) {
    return arr[fname](obj);
  };
}

function filter(prop, value) {
  switch (arguments.length) {
    case 1:
    return function (v) {
      return v === prop;
    };
    case 2:
    return function (event) {
      return get(event, prop) === value;
    };
  }
}

function mapper(prop) {
  return function (obj) {
    return get(obj, prop);
  };
}

module.exports = {
  not: not,
  mapper: mapper,
  filter: filter,
  reducer: reducer
};
