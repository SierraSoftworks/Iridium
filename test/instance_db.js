var Database = require('../index');
var Model = Database.Model;
var Instance = Database.Instance;
var should = require('should');
var Concoction = require('concoction');

describe('orm', function () {
	"use strict";

	describe('Instance', function () {
		var db = new Database({ database: 'iridium_test' });

		var model = new Model(db, 'instances', {
			username: String,
			sessions: [{
				id: String,
				expires: Date
			}]
		}, {
			preprocessors: [
				new Concoction.Rename({ '_id': 'username' })
			]
		});

		before(function(done) {
			db.connect(function(err) {
				if(err) return done(err);
				model.remove(done);
			});
		});

		after(function() {
			db.disconnect();
		});

		describe('database', function () {
			describe('save', function() {
				it('should correctly store changes made to the instance', function(done) {
					model.create({
						username: 'billy',
						sessions: [{
							id: 'aaaa',
							expires: new Date()
						}]
					}, function(err, original) {
						if(err) return done(err);

						original.sessions.push({
							id: 'bbbb',
							expires: new Date()
						});

						original.save(function(err, updated) {
							if(err) return done(err);
							updated.should.equal(original);
							updated.sessions.length.toString().should.eql('2');

							done();
						});
					});
				});
			});
		});
	});
});