/// <reference path="../nodelib/node.js"/>
/// <reference path="../nodelib/mocha.js"/>
/// <reference path="../nodelib/should.js"/>
/// <reference path="../index.js"/>

var config = require('./config');
var Database = require('../index');
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

		describe('database', function() {
			var model = null;

			before(function(done) {
				model =  new Model(db, 'model', {
					name: /.+/
				}, {
					preprocessors: [new Concoction.Rename({ _id: 'name' })]
				});

				model.remove(function(err) {
					if(err) return done(err);

					model.create({
						name: 'Demo1'
					}, function(err, instance) {
						if(err) return done(err);
						return done();
					});
				});
			});

			describe('findOne', function() {
				it('should be able to locate a single object', function(done) {
					model.findOne({ name: 'Demo1' }, function(err, obj) {
						if(err) return done(err);
						should.exist(obj);
						obj.should.have.property('name', 'Demo1');
						done();
					});
				});

				it('should be able to infer the _id field', function(done) {
					model.findOne('Demo1', function(err, obj) {
						if(err) return done(err);
						should.exist(obj);
						obj.should.have.property('name', 'Demo1');
						done();
					});
				});

				it('should not throw an error if it couldn\'t find an object', function(done) {
					model.findOne({ name: 'NotFound' }, function(err, obj) {
						if(err) return done(err);
						should.not.exist(obj);
						done();
					});
				});

				describe('with default model', function() {					
					before(function(done) {
						model =  new Model(db, 'model', {
							name: /.+/
						}, {

						});

						model.remove(function(err) {
							if(err) return done(err);

							model.create({
								name: 'Demo1'
							}, function(err, instance) {
								if(err) return done(err);
								return done();
							});
						});
					});

					var d1instance = null;

					it('should correctly be able to find using conditions', function(done) {
						model.findOne({ name: 'Demo1' }, function(err, obj) {
							if(err) return done(err);
							should.exist(obj);
							obj.should.have.property('name', 'Demo1');
							d1instance = obj;
							done();
						});
					});

					it('should correctly infer the _id field and convert conditions', function(done) {
						model.findOne(d1instance.id, function(err, obj) {
							if(err) return done(err);
							should.exist(obj);
							obj.should.have.property('id').with.type('string');
							obj.should.have.property('name', 'Demo1');
							done();
						});
					});
				});
			});
		});
	});
});
