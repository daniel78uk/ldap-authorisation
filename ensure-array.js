'use strict';

// [String] || String -> [String]
const toArray = i => Array.isArray(i) ? i : [i];

module.exports = {
  toArray
};
