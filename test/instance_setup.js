var Database = require('../index');
var Model = Database.Model;
var Instance = Database.Instance;
var should = require('should');
var Concoction = require('concoction');

describe('orm', function () {
	"use strict";

	describe('Instance', function () {
		var db = {
			plugins: []
		};

		describe('setup', function () {

			describe('document', function() {
				it('should present all properties of the received document', function () {
					var model = new Model(db, 'model', {
					}, {
						preprocessors: []
					})

					var i = new model.Instance({
						id: 'custom_id',
						name: 'name'
					});

					i.should.have.property('id', 'custom_id');
					i.should.have.property('name', 'name');
				});

				it('should correctly respond to preprocessing changes', function() {
					var model = new Model(db, 'model', {
							pretty: String
						},{
							preprocessors: [
								new Concoction.Rename({
									uglyName: 'pretty'
								})
							]
						});

					var i = new model.Instance({
						_id: 'custom_id',
						uglyName: 'value'
					});

					i.should.have.property('pretty', 'value');
				});
			});

			describe('schema', function() {
				it("should add all root level schema nodes as getter/setters to the model's instance prototype", function() {
					var model = new Model(db, 'model', {
						name: String
					});

					model.Instance.prototype.hasOwnProperty('name').should.be.true;
				});

				it('should allow a custom schema', function () {
					var model = new Model(db, 'model', {
							name: String,
							age: { type: Number, required: false }
						}, {
							preprocessors: []
						});

					var i = new model.Instance({
						id: 'custom_id',
						name: 'name'
					});

					i.should.have.property('id', 'custom_id');
					i.should.have.property('name', 'name');
					i.should.have.property('age').and.eql(null);
				});

			});

			describe('methods', function() {
				it("should be added to the instance's prototype", function() {
					var model = new Model(db, 'model', {}, {
						methods: {
							testMethod: function() { }
						}
					});

					model.Instance.prototype.should.have.ownProperty('testMethod').and.be.type('function');
				});

				it('should receive all passed arguments', function() {
					var model = new Model(db, 'model', {}, {
						methods: {
							testMethod: function(a,b,c,d) {
								a.should.eql('a');
								b.should.eql('b');
								c.should.eql('c');
								d.should.eql('d');
							}
						}
					});

					var instance = new model.Instance({});
					instance.testMethod('a','b','c','d');
				});

				it("should have `this` set to the instance they're called on", function() {
					var instance = null;
					var model = new Model(db, 'model', {}, {
						methods: {
							testMethod: function() {
								this.should.equal(instance);
							}
						}
					});

					instance = new model.Instance({});
					instance.testMethod();
				});
			});

			describe('virtuals', function() {
				it('should create basic getters', function() {
					var model = new Model(db, 'model', {}, {
						virtuals: {
							fullname: function () { return this.firstname + ' ' + this.lastname; }
						}
					});

					model.Instance.prototype.should.have.ownProperty('fullname');

					var i = new model.Instance({
						_id: 'custom_id',
						firstname: 'Billy',
						lastname: 'Bob'
					});

					i.fullname.should.equal('Billy Bob');
				});

				it('should create getter + setters', function() {
					var model = new Model(db, 'model', {}, {
						virtuals: {
							fullname: {
								get: function () { return this.firstname + ' ' + this.lastname; },
								set: function(value) {
									this.firstname = value.split(' ')[0];
									this.lastname = value.split(' ')[1];
								}
							}
						}
					});

					model.Instance.prototype.should.have.ownProperty('fullname');

					var i = new model.Instance({
						_id: 'custom_id',
						firstname: 'Billy',
						lastname: 'Bob'
					});

					i.fullname.should.equal('Billy Bob');

					i.fullname = 'Sally Jane';
					i.firstname.should.equal('Sally');
					i.lastname.should.equal('Jane');
				});
			});
		});
	});
});