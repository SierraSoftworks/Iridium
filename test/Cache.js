var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../_references.d.ts" />
var Iridium = require('../index');
var Instance = (function (_super) {
    __extends(Instance, _super);
    function Instance() {
        _super.apply(this, arguments);
    }
    return Instance;
})(Iridium.Instance);
describe("Cache", function () {
    describe("implementations", function () {
        describe("NoOp", function () {
            var noOpCache = new Iridium.NoOpCache();
            it("should pretend to cache objects", function () {
                return chai.expect(noOpCache.set("test", {})).to.eventually.be.eql({});
            });
            it("should return undefined for keys which were cached", function () {
                return chai.expect(noOpCache.get("test")).to.eventually.be.undefined;
            });
            it("should return undefined for keys which were not cached", function () {
                return chai.expect(noOpCache.get("uncached")).to.eventually.be.undefined;
            });
            it("should report that objects were not in the cache when removing them", function () {
                return chai.expect(noOpCache.clear("test")).to.eventually.be.false;
            });
        });
        describe("Memory", function () {
            var memCache = new Iridium.MemoryCache();
            it("should cache objects", function () {
                return chai.expect(memCache.set("test", {})).to.eventually.be.eql({});
            });
            it("should return cached objects when requested", function () {
                return chai.expect(memCache.get("test")).to.eventually.be.eql({});
            });
            it("should return undefined if the object does not exist in the cache", function () {
                return chai.expect(memCache.get("uncached")).to.eventually.be.undefined;
            });
            it("should report if an object was present in the cache when removed", function () {
                return chai.expect(memCache.clear("test")).to.eventually.be.true;
            });
            it("should report if an object was not present in the cache when removed", function () {
                return chai.expect(memCache.clear("uncached")).to.eventually.be.false;
            });
            it("should actually remove an object from the cache", function () {
                return chai.expect(memCache.get("test")).to.eventually.be.undefined;
            });
        });
    });
    describe("controllers", function () {
        describe("CacheOnID", function () {
            var director = new Iridium.CacheOnID();
            it("should only report that objects with an _id field are cacheable", function () {
                chai.expect(director.valid({ _id: 'test' })).to.be.true;
                chai.expect(director.valid({ noID: 'test' })).to.be.false;
            });
            it("should generate a key based on the object's ID", function () {
                chai.expect(director.buildKey({ _id: 'test' })).to.be.equal('test');
            });
            it("should only report that queries which specify the _id field are usable", function () {
                chai.expect(director.validQuery({ _id: 'test' })).to.be.true;
                chai.expect(director.validQuery({ notID: 'test' })).to.be.false;
            });
            it("should generate a key based on the query ID", function () {
                chai.expect(director.buildQueryKey({ _id: 'test' })).to.be.equal('test');
            });
        });
    });
    describe("integration", function () {
        var core = new Iridium.Core({
            database: 'test'
        });
        var model = new Iridium.Model(core, Instance, 'test', { _id: false }, {
            cache: new Iridium.CacheOnID()
        });
        before(function () { return core.connect().then(function () {
            core.cache = new Iridium.MemoryCache();
        }).then(function () { return model.create({}); }); });
        after(function () { return core.close(); });
        describe("cache", function () {
            it("should be set on the Iridium Core", function () {
                core.cache = new Iridium.MemoryCache();
            });
            it("should be available through the Iridium Core", function () {
                chai.expect(core.cache).to.be.instanceOf(Iridium.MemoryCache);
            });
        });
        describe("director", function () {
            it("should be available through the model's cache field", function () {
                chai.expect(model.cacheDirector).to.be.instanceOf(Iridium.CacheOnID);
            });
        });
        describe("should be populated", function () {
            beforeEach(function () { return core.cache = new Iridium.MemoryCache(); });
            it("when a single document is retrieved", function () {
                return model.get().then(function (instance) {
                    return chai.expect(core.cache.get(instance._id)).to.eventually.exist;
                });
            });
            it("when an instance is modified", function () {
                return model.get().then(function (instance) {
                    core.cache = new Iridium.MemoryCache();
                    return instance.save();
                }).then(function (instance) { return chai.expect(core.cache.get(instance._id)).to.eventually.exist; });
            });
        });
        describe("should be hit", function () {
            var instanceID;
            beforeEach(function () { return core.connect().then(function () { return model.remove(); }).then(function () { return model.insert({}); }).then(function () {
                core.cache = new Iridium.MemoryCache();
            }).then(function () { return model.get(); }).then(function (instance) {
                instanceID = instance._id;
                return instance.remove().then(function () {
                    return model.cache.set(instance.document);
                });
            }); });
            it("when a single document is retrieved", function () {
                return chai.expect(model.get(instanceID)).to.eventually.exist;
            });
            it("when a document is requested which matches the conditions", function () {
                return chai.expect(model.get({ _id: instanceID })).to.eventually.exist;
            });
        });
        describe("should be cleaned", function () {
            beforeEach(function () { return model.insert({}).then(function () { return model.get(); }); });
            it("when an instance is removed", function () {
                return model.get().then(function (instance) { return instance.remove(); }).then(function (instance) { return chai.expect(core.cache.get(instance._id)).to.eventually.be.undefined; });
            });
            it("when remove is called with compatible conditions", function () {
                return model.get().then(function (instance) {
                    return model.remove({ _id: instance._id }).then(function () { return instance; });
                }).then(function (instance) { return chai.expect(core.cache.get(instance._id)).to.eventually.be.undefined; });
            });
        });
    });
});
//# sourceMappingURL=Cache.js.map