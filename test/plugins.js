var Database = require('../index.js');
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
});