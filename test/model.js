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

		describe('database', function() {
			var model = null;

			before(function(done) {
				model =  new Model(db, 'model', {
					name: /.+/
				}, {
					rename: {
						_id: 'name'
					},
					transforms: {
						_id: false
					}
				});

				model.remove(done);
			});

			describe('insertion', function() {

				it('should allow a single object to be inserted', function(done) {
					model.create({
						name: 'Demo1'
					}, function(err, instance) {
						if(err) return done(err);
						instance.should.have.ownProperty('name', 'Demo1');
						return done();
					});
				});

				it('should have created the instance in the database', function(done) {
					model.count({ name: 'Demo1' }, function(err, number) {
						if(err) return done(err);
						number.should.eql(1);
						done();
					});
				});

				it('should allow multiple objects to be inserted', function(done) {
					model.create([{
						name: 'Demo2'
					}, {
						name: 'Demo3'
					}], function(err, instances) {
						if(err) return done(err);
						should(Array.isArray(instances));
						instances[0].should.have.ownProperty('name', 'Demo2');
						instances[1].should.have.ownProperty('name', 'Demo3');
						return done();
					});
				});

				it('should pass along DB errors', function(done) {
					model.create({
						name: 'Demo1'
					}, function(err, inserted) {
						should.exist(err);
						should.not.exist(inserted);
						done();
					});
				});
			});

			describe('findOne', function() {
				it('should be able to locate a single object', function(done) {
					model.findOne({ name: 'Demo1' }, function(err, obj) {
						if(err) return done(err);
						should.exist(obj);
						obj.should.have.ownProperty('name', 'Demo1');
						done();
					})
				});

				it('should not throw an error if it couldn\'t find an object', function(done) {
					model.findOne({ name: 'NotFound' }, function(err, obj) {
						if(err) return done(err);
						should.not.exist(obj);
						done();
					})
				});
			});
		});
	});
});
