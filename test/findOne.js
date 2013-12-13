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
