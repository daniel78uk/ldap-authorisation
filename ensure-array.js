'use strict';

const R = require('ramda');

const toArray = R.unless(R.is(Array), R.of);

module.exports = {
  toArray
};
