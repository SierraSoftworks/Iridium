var EventEmitter = require('events').EventEmitter;

function EventEmitterCache() {
    this.cache = {};
}

EventEmitterCache.prototype.__proto__ = EventEmitter.prototype;
EventEmitterCache.prototype.valid = function(conditions) {
    return conditions && conditions._id;
};
EventEmitterCache.prototype.store = function(conditions, document, callback) {
    this.emit('store');
    var id = JSON.stringify(document._id);
    this.cache[id] = document;
    callback();
};
EventEmitterCache.prototype.fetch = function(document, callback) {
    var id = JSON.stringify(document._id);
    if(this.cache[id]) this.emit('fetched');
    callback(this.cache[id]);
};
EventEmitterCache.prototype.drop = function(document, callback) {
    var id = JSON.stringify(document._id);
    if(this.cache[id]) {
        delete this.cache[id];
        this.emit('dropped');
    }
    callback();
};

describe('orm', function () {
    "use strict";

    describe('Model', function () {
        var db = new Database(config);

        before(function () {
            return db.connect();
        });

        describe('cache', function() {
            var model = null;

            before(function() {
                model =  new Model(db, 'model', {
                    name: /.+/
                }, {
                    preprocessors: [new Concoction.Rename({ _id: 'name' })],
                    cache: new EventEmitterCache()
                });

                return model.remove().then(function() {
                    return model.create({ name: 'Demo1' });
                });
            });

            describe('findOne', function() {
                it('should store newly retrieved documents in the cache', function() {
                    var stored = false;

                    model.cache.once('store', function() { stored = true; });

                    return model.findOne('Demo1').then(function(instance) {
                        should.exist(instance);
                        stored.should.be.true;
                    });
                });

                it('should fetch retrieved documents from the cache', function() {
                    var fetched = false;

                    model.cache.once('fetched', function() { fetched = true; });

                    return model.findOne('Demo1').then(function(instance) {
                        should.exist(instance);
                        fetched.should.be.true;
                    });
                });
            });
        });
    });
});
