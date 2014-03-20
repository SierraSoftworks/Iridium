var Database = require('../');
var Model = Database.Model;
var Instance = Database.Instance;
var should = require('should');

describe('plugins', function() {
	describe('custom validation', function() {
		var plugin = {
			validate: function(schema, value) {
				if(schema == 'Positive')
					return this.assert(value >= 0, 'positive number');
			}
		};

		it('should correctly validate models upon creation', function(done) {
			var model = new Model({
				plugins: [plugin],
				db: {
					collection: function() { return null; }
				}
			}, 'collection',
			{ name: String, age: 'Positive'	},
			{});

			model.insert({
				name: 'test', age: -1
			}, function(err, instance) {
				should.exist(err);
				should.not.exist(instance);
				done();
			});
		});
	});

	describe('model creation', function() {
		var plugin = {
			newModel: function(db, collection, schema, options) {
				options.done();
			}
		};

		it('should correctly trigger the newModel hook', function(done) {
			var model = new Model({
					plugins: [plugin],
					db: {
						collection: function() { return null; }
					}
				}, 'collection',
				{ name: String, age: 'Positive'	},
				{ done: done });
		});
	});

	describe('instance creation', function() {
		var plugin = {
			newInstance: function(model, doc, isNew) {
				model.options.done();
			}
		};

		it('should correctly trigger the newInstance hook', function(done) {
			var model = new Model({
					plugins: [plugin]
				}, 'collection',
				{ name: String, age: 'Positive'	},
				{ done: done, preprocessors: [] });

			var instance = new Instance(model, {
				name: 'Test',
				age: 10
			});
		});
	});
});