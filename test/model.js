/// <reference path="../nodelib/node.js"/>
/// <reference path="../nodelib/mocha.js"/>
/// <reference path="../nodelib/should.js"/>
/// <reference path="../index.js"/>

var config = require('./config');
var Database = require('../index');
var Model = Database.Model;
var Instance = Database.Instance;
var should = require('should');

describe('orm', function () {
	"use strict";

	describe('Model', function () {
		var db = null;

		before(function (done) {
			db = new Database(config);
			db.connect(done);
		});

		describe('constructor', function () {
			it('should allow a new model to be created', function () {
				var model = new Model(db, 'model', {
					
				}, {

				});
			});
		});
	});
});
