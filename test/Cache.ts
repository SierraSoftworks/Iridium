import * as Iridium from "../iridium";
import * as chai from "chai";

interface Document {
    _id?: string;
}

class Instance extends Iridium.Instance<Document, Instance> {
    static collection = "test";
    static schema: Iridium.Schema = { _id: false };
    static cache = new Iridium.CacheOnID();

    _id: string;
}

describe("Cache",() => {
    describe("implementations",() => {

        describe("NoOp",() => {
            let noOpCache = new Iridium.NoOpCache();

            it("should pretend to cache objects",() => {
                return chai.expect(noOpCache.set("test", {})).to.eventually.be.eql({});
            });

            it("should return undefined for keys which were cached",() => {
                return chai.expect(noOpCache.get("test")).to.eventually.be.undefined;
            });

            it("should return undefined for keys which were not cached",() => {
                return chai.expect(noOpCache.get("uncached")).to.eventually.be.undefined;
            });

            it("should report that objects were not in the cache when removing them",() => {
                return chai.expect(noOpCache.clear("test")).to.eventually.be.false;
            });
        });

        describe("Memory",() => {
            let memCache = new Iridium.MemoryCache();

            it("should cache objects",() => {
                return chai.expect(memCache.set("test", {})).to.eventually.be.eql({});
            });

            it("should return cached objects when requested",() => {
                return chai.expect(memCache.get("test")).to.eventually.be.eql({});
            });

            it("should return undefined if the object does not exist in the cache",() => {
                return chai.expect(memCache.get("uncached")).to.eventually.be.undefined;
            });

            it("should report if an object was present in the cache when removed",() => {
                return chai.expect(memCache.clear("test")).to.eventually.be.true;
            });

            it("should report if an object was not present in the cache when removed",() => {
                return chai.expect(memCache.clear("uncached")).to.eventually.be.false;
            });

            it("should actually remove an object from the cache",() => {
                return chai.expect(memCache.get("test")).to.eventually.be.undefined;
            });
        });

    });

    describe("controllers",() => {

        describe("CacheOnID",() => {
            let director = new Iridium.CacheOnID();

            it("should only report that objects with an _id field are cacheable",() => {
                chai.expect(director.valid({ _id: "test" })).to.be.true;
                chai.expect(director.valid(<any>{ noID: "test" })).to.be.false;
            });

            it("should generate a key based on the object's ID",() => {
                chai.expect(director.buildKey({ _id: "test" })).to.be.equal("test");
            });

            it("should only report that queries which specify the _id field are usable",() => {
                chai.expect(director.validQuery({ _id: "test" })).to.be.true;
                chai.expect(director.validQuery({ notID: "test" })).to.be.false;
            });

            it("should generate a key based on the query ID",() => {
                chai.expect(director.buildQueryKey({ _id: "test" })).to.be.equal("test");
            });
        });

    });

    describe("integration",() => {
        let core = new Iridium.Core({
            database: "test"
        });

        let model = new Iridium.Model<Document, Instance>(core, Instance);

        before(() => core.connect().then(() => {
            core.cache = new Iridium.MemoryCache();
        }).then(() => model.create({})));

        after(() => core.close());

        describe("cache",() => {
            it("should be set on the Iridium Core",() => {
                core.cache = new Iridium.MemoryCache();
            });

            it("should be available through the Iridium Core",() => {
                chai.expect(core.cache).to.be.instanceOf(Iridium.MemoryCache);
            });
        });

        describe("director",() => {
            it("should be available through the model's cache field",() => {
                chai.expect(model.cacheDirector).to.be.instanceOf(Iridium.CacheOnID);
            });
        });

        describe("should be populated",() => {
            beforeEach(() => {
                core.cache = new Iridium.MemoryCache()
            });

            it("when a single document is retrieved",() => {
                return model.get().then((instance) =>
                    chai.expect(core.cache.get(instance._id)
                    ).to.eventually.exist);
            });

            it("when an instance is modified",() => {
                return model.get().then((instance) => {
                    core.cache = new Iridium.MemoryCache();
                    return instance.save();
                }).then((instance) => chai.expect(core.cache.get(instance._id)).to.eventually.exist);
            });
        });

        describe("should be hit",() => {
            let instanceID: string;
            beforeEach(() => core.connect().then(() => model.remove()).then(() => model.insert({})).then(() => {
                core.cache = new Iridium.MemoryCache();
            }).then(() => model.get()).then(instance => {
                instanceID = instance._id;
                // Remove the instance from the database and put it back into the cache
                return instance.remove().then(() => {
                    return model.cache.set(instance.document);
                });
            }));

            it("when a single document is retrieved",() => {
                return chai.expect(model.get(instanceID)).to.eventually.exist;
            });

            it("when a document is requested which matches the conditions",() => {
                return chai.expect(model.get({ _id: instanceID })).to.eventually.exist;
            });
        });

        describe("should be cleaned",() => {
            beforeEach(() => model.insert({}).then(() => model.get()));

            it("when an instance is removed",() => {
                return model.get().then(instance => instance.remove()).then(instance => chai.expect(core.cache.get(instance._id)).to.eventually.be.undefined);
            });

            it("when remove is called with compatible conditions",() => {
                return model.get().then(instance => {
                    return model.remove({ _id: instance._id }).then(() => instance);
                }).then(instance => chai.expect(core.cache.get(instance._id)).to.eventually.be.undefined);
            });
        });
    });
});