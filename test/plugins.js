var skmatc = require('skmatc');

describe('plugins', function() {
    describe('custom validation', function() {
        var plugin = {
            validate: skmatc.Validator.module(function(schema) { return schema == 'Positive'; },
                function(schema, data, path) { return this.assert(data >= 0); })         
        };

        it('should correctly validate models upon creation', function() {
            var model = new Model({
                plugins: [plugin],
                db: {
                    collection: function() { return null; }
                }
            }, 'collection',
            { name: String, age: 'Positive' },
            {});

            return model.insert({
                name: 'test', age: -1
            }).then(function(instance) {
                should.fail();
            }, function(err) {
                should.exist(err);
                err.isValidationError.should.be.true;
                return Promise.resolve();
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
                { name: String, age: 'Positive' },
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
                { name: String, age: 'Positive' },
                { done: done, preprocessors: [] });

            var instance = new Instance(model, {
                name: 'Test',
                age: 10
            });
        });
    });
});