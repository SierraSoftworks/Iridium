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

	describe('Instance', function () {
		describe('diff', function () {
			it('should generate $set for basic changes', function () {
				Instance.diff({ x: 1 }, { x: 2 }).should.eql({ $set: { x: 2 } });
			});

			it('should not generate $set for unnecessary changes', function () {
				Instance.diff({ x: 1, y: 1 }, { x: 1, y: 2 }).should.eql({ $set: { y: 2 } });
				Instance.diff({ a: [1], b: 1 }, { a: [1], b: 2 }).should.eql({ $set: { b: 2 } });
			});

			it('should generate $set for new properties', function () {
				Instance.diff({ a: 1 }, { a: 1, b: 1 }).should.eql({ $set: { b: 1 } });
			});

			it('should generate $set for array changes', function () {
				Instance.diff({ a: [1] }, { a: [1, 2] }).should.eql({ $set: { a: [1, 2] } });
			});

			it('should generate recursive $set for child properties', function () {
				Instance.diff({ a: { b: 1, c: 1 } }, { a: { b: 1, c: 2 } }).should.eql({ $set: { 'a.c': 2 } });
			});
		});

		describe('constructor', function () {
			it('should present all properties of the document', function () {
				var i = new Instance({}, {
					_id: 'custom_id',
					name: 'name'
				}, {});

				i.should.have.property('id', 'custom_id');
				i.should.have.property('name', 'name');
			});

			it('should allow renaming of properties', function () {
				var i = new Instance({}, {
					_id: 'custom_id',
					uglyName: 'value'
				}, {
					rename: {
						uglyName: 'pretty'
					}
				});

				i.should.have.property('pretty', 'value');
			});

			it('should allow the creation of methods', function () {
				var i = new Instance({}, {
					_id: 'custom_id'
				}, {
					methods: {
						test: function () { return true; }
					}
				});

				i.test().should.equal(true);
			});

			it('should correctly pass all arguments to a method', function () {
				var i = new Instance({}, {
					_id: 'custom_id'
				}, {
					methods: {
						test: function (a, b, c) {
							should.equal(a, 'a');
							should.equal(b, 'b');
							should.equal(c, 'c');
						}
					}
				});

				i.test('a', 'b', 'c');
			});

			it('should allow the creation of virtual properties', function () {
				var i = new Instance({}, {
					_id: 'custom_id',
					firstname: 'Billy',
					lastname: 'Bob'
				}, {
					virtuals: {
						fullname: function () { return this.firstname + ' ' + this.lastname; }
					}
				});

				i.fullname.should.equal('Billy Bob');
			});

			it('should allow a custom schema', function () {
				var i = new Instance({}, {
					_id: 'custom_id',
					name: 'name'
				}, {
					schema: {
						name: String,
						age: { type: Number, required: false }
					}
				});

				(function () {
					i.age = 'hello';
				}).should.throwError();

				i.should.have.property('id', 'custom_id');
				i.should.have.property('name', 'name');
				i.should.have.property('age', null);
			});
		});
	});

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
