var config = require('./config.js');
var Database = require('../index.js');
var Model = Database.Model;
var Instance = Database.Instance;
var should = require('should');
var Concoction = require('concoction');

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

			it('should return an object with isModel set to true', function() {
				var model = new Model(db, 'model', {}, {});
				model.isModel.should.be.true;
			});

			it('should return a new instance even if called without the new keyword', function() {
				var $ = {};
				var model = Model.call($, db, 'model', {}, {});
				should(model instanceof Model);
			});

			it('should provide the full model API', function() {
				var api = [
					'preprocessor',
					'options',
					'schema',
					'database',
					'collection',
					'extraValidators',
					'wrap',
					'toSource',
					'fromSource',
					'find',
					'findOne',
					'get',
					'insert',
					'create',
					'update',
					'count',
					'remove',
					'aggregate',
					'ensureIndex',
					'setupIndexes'
				];
				
				var model = new Model(db, 'model', {
					
				}, {

				});

				for(var i = 0; i < api.length; i++)
					model.should.have.property(api[i]);
			});
		});
	});
});
