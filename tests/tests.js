'use strict';

var chai = require('chai');
var expect = require('chai').expect;
var request = require('supertest');

// import libs
var express = require('express');

describe('LDAP utils', function() {
  var app = {};

  beforeEach(function() {
    app = express();
  });

  it('Should pass', function() {
    expect(true).to.not.equal(false);
  });

});
