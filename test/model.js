describe('orm', function () {
	"use strict";

	describe('Model', function () {
		var db = new Database(config);

		before(function () {
			return db.connect();
		});

	    after(function() {
	        db.disconnect();
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
				(model instanceof Model).should.be.true;
			});

			it('should provide the full model API', function() {
				var functions = [
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

				var properties = [
					'preprocessor',
					'options',
					'schema',
                    'schemaValidator',
					'database',
					'collection'
				];

				var model = new Model(db, 'model', {

				}, {

				});

				for(var i = 0; i < functions.length; i++)
					model.should.respondTo(functions[i]);

				for(var i = 0; i < properties.length; i++)
					model.should.have.property(properties[i]);
			});
		});
	});
});
