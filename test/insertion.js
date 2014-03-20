var config = require('./config');
var Database = require('../');
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

				model.remove(done);
			});

			describe('insertion', function() {

				it('should allow a single object to be inserted', function(done) {
					model.create({
						name: 'Demo1'
					}, function(err, instance) {
						if(err) return done(err);
						instance.should.have.property('name', 'Demo1');                        
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
						instances[0].should.have.property('name', 'Demo2');
						instances[1].should.have.property('name', 'Demo3');
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
		});
	});
});
