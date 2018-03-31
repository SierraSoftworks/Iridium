import * as Iridium from "../iridium";
import * as MongoDB from "mongodb";
import {Cursor} from "../lib/Cursor";
import {Delay} from "../lib/utils/Promise";
import * as _ from "lodash";
import * as chai from "chai";

class TestCore extends Iridium.Core {
    constructor() {
        super("mongodb://localhost/iridium_test");
    }
}

interface TestDocument {
    _id?: string;
    answer: number;
}

class Test extends Iridium.Instance<TestDocument, Test> implements TestDocument {
    static collection = "test";
    static schema: Iridium.Schema = {
        _id: MongoDB.ObjectID,
        answer: Number
    };

    _id: string;
    answer: number;
}

class TestWithCustomID extends Test {
    static transforms: Iridium.Transforms = {
        _id: {
            fromDB: x => x * 10,
            toDB: x => x / 10
        }
    };
}

describe("Model",() => {
    let core = new Iridium.Core({ database: "test" });

    before(() => core.connect());
    after(() => core.close());

    describe("constructor", () => {
        function createInstanceImplementation(properties: any): any {
            let fn = function() { return {}; };
            _.merge(fn, properties);
            return fn;
        }

        it("should throw an error if you don't provide a valid core",() => {
            chai.expect(() => {
                new Iridium.Model<any, any>(<any>null, createInstanceImplementation({
                    collection: "test",
                    schema: { _id: false }
                }))
            }).to.throw("You failed to provide a valid Iridium core for this model");
        });

        it("should throw an error if you don't provide a valid instanceType",() => {
            chai.expect(() => {
                new Iridium.Model<any, any>(core, <any>null)
            }).to.throw("You failed to provide a valid instance constructor for this model");
        });

        it("should throw an error if you don't provide a collection name",() => {
            chai.expect(() => {
                new Iridium.Model<any, any>(core,createInstanceImplementation({
                    schema: { _id: false }
                }))
            }).to.throw("You failed to provide a valid collection name for this model");

            chai.expect(() => {
                new Iridium.Model<any, any>(core, createInstanceImplementation({
                    collection: "",
                    schema: { _id: false }
                }))
            }).to.throw("You failed to provide a valid collection name for this model");

            chai.expect(() => {
                new Iridium.Model<any, any>(core,createInstanceImplementation({
                    collection: 4,
                    schema: { _id: false }
                }))
            }).to.throw("You failed to provide a valid collection name for this model");
        });

        it("should throw an error if you don't provide a valid schema",() => {
            chai.expect(() => {
                new Iridium.Model<any, any>(core, createInstanceImplementation({
                    collection: "test"
                }))
            }).to.throw("You failed to provide a valid schema for this model");

            chai.expect(() => {
                new Iridium.Model<any, any>(core,createInstanceImplementation({
                    collection: "test",
                    schema: { id: false }
                }))
            }).to.throw("You failed to provide a valid schema for this model");
        });

        it("should correctly set the core",() => {
            chai.expect(new Iridium.Model(core, createInstanceImplementation({
                    collection: "test",
                    schema: { _id: false }
                })).core).to.equal(core);
        });

        it("should correctly set the collectionName",() => {
            chai.expect(new Iridium.Model(core, createInstanceImplementation({
                    collection: "test",
                    schema: { _id: false }
                })).collectionName).to.equal("test");
        });

        it("should correctly set the schema",() => {
            chai.expect(new Iridium.Model(core, createInstanceImplementation({
                    collection: "test",
                    schema: { _id: true }
                })).schema).to.eql({ _id: true });
        });

        it("should correctly default to ObjectID if no _id schema type is specified",() => {
            chai.expect(new Iridium.Model(core, createInstanceImplementation({
                    collection: "test",
                    schema: { _id: false }
                })).schema).to.eql({ _id: MongoDB.ObjectID });
        });
    });

    describe("methods",() => {
        let test = new Iridium.Model(core, Test);

        it("should expose create()",() => { chai.expect(test.create).to.exist.and.be.a("function") });
        it("should expose insert()",() => { chai.expect(test.insert).to.exist.and.be.a("function") });
        it("should expose remove()",() => { chai.expect(test.remove).to.exist.and.be.a("function") });
        it("should expose findOne()",() => { chai.expect(test.findOne).to.exist.and.be.a("function") });
        it("should expose get()",() => { chai.expect(test.get).to.exist.and.be.a("function") });
        it("should expose find()",() => { chai.expect(test.find).to.exist.and.be.a("function") });
        it("should expose count()",() => { chai.expect(test.count).to.exist.and.be.a("function") });
        it("should expose ensureIndex()",() => { chai.expect(test.ensureIndex).to.exist.and.be.a("function") });
        it("should expose ensureIndexes()",() => { chai.expect(test.ensureIndexes).to.exist.and.be.a("function") });
        it("should expose dropIndex()",() => { chai.expect(test.dropIndex).to.exist.and.be.a("function") });
        it("should expose dropIndexes()",() => { chai.expect(test.dropIndexes).to.exist.and.be.a("function") });
    });

    describe("properties",() => {
        let test = new Iridium.Model(core, Test);

        it("should expose core",() => {
            chai.expect(test).to.have.property("core");
            chai.expect(test.core).to.equal(core);
        });
        it("should expose collection",() => {
            chai.expect(test).to.have.property("collection");
        });
        it("should expose collectionName",() => {
            chai.expect(test).to.have.property("collectionName");
            chai.expect(test.collectionName).to.equal("test");
            test.collectionName = "changed";
            chai.expect(test.collectionName).to.equal("changed");
        });
        it("should expose schema",() => { chai.expect(test).to.have.property("schema") });
        it("should expose helpers",() => { chai.expect(test).to.have.property("helpers") });
        it("should expose handlers",() => { chai.expect(test).to.have.property("handlers") });
        it("should expose cache",() => { chai.expect(test).to.have.property("cache") });
        it("should expose cacheDirector",() => { chai.expect(test).to.have.property("cacheDirector") });
        it("should expose transforms",() => { chai.expect(test).to.have.property("transforms") });
        it("should expose indexes",() => { chai.expect(test).to.have.property("indexes") });
        it("should expose Instance",() => { chai.expect(test.Instance).to.exist.and.be.a("function") });
    });

    describe("collection",() => {
        it("should throw an error if you attempt to access it before connecting to the database",() => {
            let model = new Iridium.Model(new Iridium.Core("mongodb://localhost/test"), Test);
            chai.expect(() => model.collection).to.throw("Iridium Core not connected to a database.");
        });
    });

    describe("create()",() => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);

        before(() => {
            return core.connect()
        });

        after(() => {
            return model.remove().then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.create).to.exist.and.be.a("function");
        });

        it("should allow the insertion of a single document",() => {
            return chai.expect(model.create({ answer: 10 })).to.eventually.be.ok;
        });

        it("should return a document if a single document is inserted",() => {
            return chai.expect(model.create({ answer: 10 })).to.eventually.have.property("answer", 10);
        });

        it("should allow the insertion of multiple documents",() => {
            return chai.expect(model.create([
                { answer: 11 },
                { answer: 12 },
                { answer: 13 }
            ])).to.eventually.exist.and.have.lengthOf(3);
        });

        it("should allow you to provide options to control the creation",() => {
            return chai.expect(model.create({ answer: 14 }, { upsert: true })).to.eventually.exist;
        });

        it("should generate an _id for new, upserted, documents", () => {
            return chai.expect(model.create({ answer: 12 }, { upsert: true })).to.eventually.exist.and.have.property("_id").and.exist;
        })

        it("should return an error if you don't meet the schema validation requirements",() => {
           return chai.expect(model.create(<any>{ answer: "wrong" })).to.eventually.be.rejected;
        });

        it("should support a callback style instead of promises",(done) => {
            model.create({ answer: 15 },(err, inserted) => {
                if (err) return done(err);
                chai.expect(inserted).to.exist.and.have.property("answer", 15);
                return done();
            });
        });
    });

    describe("insert()",() => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);

        before(() => {
            return core.connect()
        });

        after(() => {
            return model.remove().then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.insert).to.exist.and.be.a("function");
        });

        it("should allow the insertion of a single document",() => {
            return chai.expect(model.insert({ answer: 10 })).to.eventually.be.ok;
        });

        it("should return a document if a single document is inserted",() => {
            return chai.expect(model.insert({ answer: 10 })).to.eventually.have.property("answer", 10);
        });

        it("should allow the insertion of multiple documents",() => {
            return chai.expect(model.insert([
                { answer: 11 },
                { answer: 12 },
                { answer: 13 }
            ])).to.eventually.exist.and.have.lengthOf(3);
        });

        it("should allow you to provide options to control the creation",() => {
            return chai.expect(model.insert({ answer: 14 }, { upsert: true })).to.eventually.exist;
        });

        it("should generate an _id for new, upserted, documents", () => {
            return chai.expect(model.insert({ answer: 12 }, { upsert: true })).to.eventually.exist.and.have.property("_id").and.exist;
        })

        it("should return an error if you don't meet the schema validation requirements",() => {
           return chai.expect(model.insert(<any>{ answer: "wrong" })).to.eventually.be.rejected;
        });

        it("should support a callback style instead of promises",(done) => {
            model.insert({ answer: 15 },(err, inserted) => {
                if (err) return done(err);
                chai.expect(inserted).to.exist.and.have.property("answer", 15);
                return done();
            });
        });
    });

    describe("remove()",() => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);

        beforeEach(() => {
            return core.connect().then(() => model.remove()).then(() => model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]));
        });

        after(() => {
            return model.remove().then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.remove).to.exist.and.be.a("function");
        });

        it("should allow the removal of documents matching a query",() => {
            return chai.expect(model.remove({ answer: 10 })).to.eventually.equal(1);
        });

        it("should allow just the ID to be specified",() => {
            return model.get().then(instance => {
                return chai.expect(model.remove(instance._id)).to.eventually.exist.and.equal(1);
            });
        });

        it("should allow the removal of all documents",() => {
            return chai.expect(model.remove()).to.eventually.equal(5);
        });

        it("should support a callback style instead of promises",(done) => {
            model.remove((err, removed) => {
                if (err) return done(err);
                chai.expect(removed).to.exist.and.equal(5);
                return done();
            });
        });

        it("should support a callback style instead of promises when conditions are specified",(done) => {
            model.remove({ answer: 10 }, (err, removed) => {
                if (err) return done(err);
                chai.expect(removed).to.exist.and.equal(1);
                return done();
            });
        });

        it("should support a callback style instead of promises when options are specified",(done) => {
            model.remove({ answer: 10 }, { w: 1 }, (err, removed) => {
                if (err) return done(err);
                chai.expect(removed).to.exist.and.equal(1);
                return done();
            });
        });
    });

    describe("findOne()",() => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);

        before(() => {
            return core.connect().then(() => model.remove()).then(() => model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]));
        });

        after(() => {
            return model.remove().then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.findOne).to.exist.and.be.a("function");
        });

        it("should support retrieving an random document",() => {
            return chai.expect(model.findOne()).to.eventually.exist.and.have.property("answer").is.a("number");
        });

        it("should support a query which returns nothing",() => {
            return chai.expect(model.findOne({ nothing: true })).to.eventually.not.exist;
        });

        it("should support retrieving a document using its ID",() => {
            return chai.expect(model.findOne().then((doc) => model.findOne(doc!._id))).to.eventually.exist.and.have.property("answer").is.a("number");
        });

        it("should retrieve the correct document by its ID",() => {
            return model.findOne().then((doc) => {
                return chai.expect(model.findOne(doc!._id)).to.eventually.exist.and.have.property("_id", doc!._id);
            });
        });

        it("should support retrieving a document using a selector query",() => {
            return chai.expect(model.findOne({ answer: 10 })).to.eventually.exist.and.have.property("answer", 10);
        });

        it("should support passing options to control the query",() => {
            return chai.expect(model.findOne({}, {
                sort: { answer: -1 }
            })).to.eventually.exist.and.have.property("answer", 14);
        });

        it("should allow you to limit the returned fields",() => {
            return chai.expect(model.findOne({}, {
                fields: { answer: 0 }
            }).then((instance) => instance!.answer)).to.eventually.be.undefined;
        });

        it("should support a callback style instead of promises",(done) => {
            model.findOne((err, doc) => {
                if (err) return done(err);
                chai.expect(doc).to.exist.and.have.property("answer");
                return done();
            });
        });
    });

    describe("get()",() => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);

        before(() => {
            return core.connect().then(() => model.remove()).then(() => model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]));
        });

        after(() => {
            return model.remove().then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.get).to.exist.and.be.a("function");
        });

        it("should support retrieving an random document",() => {
            return chai.expect(model.get()).to.eventually.exist.and.have.property("answer").is.a("number");
        });

        it("should support a query which returns nothing",() => {
            return chai.expect(model.get({ nothing: true })).to.eventually.not.exist;
        });

        it("should support retrieving a document using its ID",() => {
            return chai.expect(model.get().then((doc) => model.get(doc._id))).to.eventually.exist.and.have.property("answer").is.a("number");
        });

        it("should retrieve the correct document by its ID",() => {
            return model.get().then((doc) => {
                return chai.expect(model.get(doc._id)).to.eventually.exist.and.have.property("_id", doc._id);
            });
        });

        it("should support retrieving a document using a selector query",() => {
            return chai.expect(model.get({ answer: 10 })).to.eventually.exist.and.have.property("answer", 10);
        });

        it("should support passing options to control the query",() => {
            return chai.expect(model.get({}, {
                sort: { answer: -1 }
            })).to.eventually.exist.and.have.property("answer", 14);
        });

        it("should allow you to limit the returned fields",() => {
            return chai.expect(model.get({}, {
                fields: { answer: 0 }
            }).then((instance) => instance.answer)).to.eventually.be.undefined;
        });

        it("should support a callback style instead of promises",(done) => {
            model.get((err, doc) => {
                if (err) return done(err);
                chai.expect(doc).to.exist.and.have.property("answer");
                return done();
            });
        });
    });

    describe("find()",() => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);

        before(() => {
            return core.connect().then(() => model.remove()).then(() => model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]));
        });

        after(() => {
            return model.remove().then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.find).to.exist.and.be.a("function");
        });

        it("should return a cursor object",() => {
            chai.expect(model.find()).to.be.an.instanceof(Cursor);
        });

        describe("each()",() => {
            it("should call the handler with each document",() => {
                return chai.expect(model.find().forEach((instance) => {
                    chai.expect(instance).to.exist;
                })).to.eventually.not.be.rejected;
            });

            it("should return a promise immediately",() => {
                chai.expect(model.find().forEach(i => { })).to.have.property("then").a("function");
            });

            it("should resolve the promise after all handlers have been dispatched",() => {
                let count = 0;
                return chai.expect(model.find().forEach((instance) => {
                    count++;
                }).then(() => chai.expect(count).to.not.equal(5)).then(() => Delay(10)).then(() => count)).to.eventually.equal(5);
            });

            it("should be capable of functioning correctly with empty result sets",() => {
                return chai.expect(model.find({ nothing: true }).forEach((instance) => {
                    chai.assert.fail();
                })).to.eventually.not.be.rejected;
            });

            it("should support using callbacks instead of promises",(done) => {
                let count = 0;
                model.find().forEach(i => count++,(err) => {
                    if (err) return done(err);
                    Delay(10).then(() => chai.expect(count).to.eql(5)).then(() => done());
                });
            });
        });

        describe("map()",() => {
            it("should call the handler with documents",() => {
                return chai.expect(model.find().map((instance) => {
                    chai.expect(instance).to.exist;
                })).to.eventually.not.be.rejected;
            });

            it("should return the values from of each iteration",() => {
                let count = 0;
                return chai.expect(model.find().map((instance) => {
                    return count++;
                })).to.eventually.be.eql([0, 1, 2, 3, 4]);
            });

            it("should return its result promise immediately",() => {
                chai.expect(model.find().map(i => i)).to.have.property("then").a("function");
            });

            it("should only resolve its result promise after all results have been resolved",() => {
                let count = 0;
                return chai.expect(model.find().map((instance) => {
                    return count++;
                }).then(() => count)).to.eventually.equal(5);
            });

            it("should be capable of functioning correctly with empty result sets",() => {
                return chai.expect(model.find({ nothing: true }).map((instance) => {
                    chai.assert.fail();
                })).to.eventually.eql([]);
            });

            it("should support using callbacks instead of promises",(done) => {
                let count = 0;
                model.find().map(i => count++,(err, results) => {
                    if (err) return done(err);
                    chai.expect(results).to.eql([0, 1, 2, 3, 4]);
                    return done();
                });
            });
        });

        describe("toArray()",() => {
            it("should return all documents",() => {
                return chai.expect(model.find().toArray()).to.eventually.exist.and.have.length(5);
            });

            it("should be capable of functioning correctly with empty result sets",() => {
                return chai.expect(model.find({ nothing: true }).toArray()).to.eventually.eql([]);
            });

            it("should support a callback style instead of promises",(done) => {
                model.find().toArray((err, docs) => {
                    if (err) return done(err);
                    chai.expect(docs).to.exist.and.have.length(5);
                    return done();
                });
            });
        });

        describe("next()",() => {
            it("should return a promise",() => {
                chai.expect(model.find().next()).to.have.property("then").a("function");
            });

            it("which should resolve to the next instance in the query",() => {
                return chai.expect(model.find().next()).to.eventually.be.an.instanceof(model.Instance);
            });

            it("should be capable of functioning correctly with empty result sets",() => {
                return chai.expect(model.find({ nothing: true }).next()).to.eventually.not.exist;
            });

            it("should support using callbacks instead of promises",(done) => {
                model.find().next((err, instance) => {
                    if (err) return done(err);
                    chai.expect(instance).to.be.an.instanceof(model.Instance);
                    return done();
                });
            });
        });

        describe("one()", () => {
            it("should return a promise",() => {
                chai.expect(model.find().one()).to.have.property("then").a("function");
            });

            it("which should resolve to the next instance in the query",() => {
                return chai.expect(model.find().one()).to.eventually.be.an.instanceof(model.Instance);
            });

            it("should be capable of functioning correctly with empty result sets",() => {
                return chai.expect(model.find({ nothing: true }).one()).to.eventually.not.exist;
            });

            it("should support using callbacks instead of promises",(done) => {
                model.find().one((err, instance) => {
                    if (err) return done(err);
                    chai.expect(instance).to.be.an.instanceof(model.Instance);
                    return done();
                });
            });

            it("should not allow you to call it more than once", () => {
                let cursor = model.find();
                return chai.expect(cursor.one().then(() => cursor.one())).to.eventually.be.rejected;
            });
        });

        describe("rewind()",() => {
            it("should return a new cursor",() => {
                chai.expect(model.find().rewind()).to.be.an.instanceof(Cursor);
            });

            it("which should start returning items from the start of the query",() => {
                let cursor = model.find();
                return cursor.next().then(firstItem => cursor.rewind().next().then(rewoundItem => chai.expect(firstItem!.document).to.eql(rewoundItem!.document)));
            });

            it("should carry through any other attributes",() => {
                let cursor = model.find().sort({ answer: -1 }).limit(2);
                return chai.expect(cursor.toArray().then(() => cursor.rewind().map(i => i.answer))).to.eventually.eql([14, 13]);
            });
        });

        describe("count()",() => {
            it("should return a promise",() => {
                chai.expect(model.find().count()).to.have.property("then").a("function");
            });

            it("should resolve the promise with the number of documents which match the query",() => {
                return chai.expect(model.find().count()).to.eventually.be.equal(5);
            });

            it("should support using callbacks instead of promises",(done) => {
                model.find().count((err, count) => {
                    if (err) return done(err);
                    chai.expect(count).to.equal(5);
                    return done();
                });
            });
        });

        describe("limit()",() => {
            it("should return a new cursor",() => {
                chai.expect(model.find().limit(1)).to.be.instanceof(Cursor);
            });

            it("which should impose the limit",() => {
                return chai.expect(model.find().limit(2).toArray()).to.eventually.have.length(2);
            });
        });

        describe("skip()",() => {
            it("should return a new cursor",() => {
                chai.expect(model.find().skip(1)).to.be.instanceof(Cursor);
            });

            it("which should impose the limit",() => {
                return chai.expect(model.find().skip(2).count()).to.eventually.be.equal(3);
            });
        });

        describe("sort()",() => {
            it("should return a new cursor",() => {
                chai.expect(model.find().sort({ answer: 1 })).to.be.instanceof(Cursor);
            });

            it("which should perform the sort",() => {
                return chai.expect(model.find().sort({ answer: -1 }).map(i => i.answer)).to.eventually.eql([14, 13, 12, 11, 10]);
            });
        });

        describe("filtering",() => {
            it("should allow filtering using a selector",() => {
                return chai.expect(model.find({ answer: 10 }).toArray()).to.eventually.exist.and.have.length(1);
            });

            it("should allow an ID to be specified directly",() => {
                return model.find({ answer: 10 }).next().then((instance) => chai.expect(model.find(instance!._id).count()).to.eventually.equal(1));
            });

            it("should transform the conditions",() => {
                return model.get().then(instance => chai.expect(model.find({
                    _id: instance._id
                }).count()).to.eventually.equal(1));
            });

            it("should allow the returned fields to be restricted",() => {
                return chai.expect(model.find({}, { answer: 0 }).map(i => i.answer)).to.eventually.eql([undefined, undefined, undefined, undefined, undefined]);
            });
        });

        describe("readFrom()", () => {
            it("should return a new cursor", () => {
                chai.expect(model.find().readFrom("secondaryPreferred")).to.be.instanceof(Cursor);
            });
        });
    });

    describe("count()",() => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);

        before(() => {
            return core.connect().then(() => model.remove()).then(() => model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]));
        });

        after(() => {
            return model.remove().then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.count).to.exist.and.be.a("function");
        });

        it("should select all documents by default",() => {
            return chai.expect(model.count()).to.eventually.exist.and.equal(5);
        });

        it("should allow just the ID to be specified",() => {
            return model.get().then(instance => {
                return chai.expect(model.count(instance._id)).to.eventually.exist.and.equal(1);
            });
        });

        it("should allow filtering using a selector",() => {
            return chai.expect(model.count({ answer: 10 })).to.eventually.exist.and.equal(1);
        });

        it("should support a callback style instead of promises",(done) => {
            model.count((err, docs) => {
                if (err) return done(err);
                chai.expect(docs).to.exist.and.equal(5);
                return done();
            });
        });
    });

    describe("update()",() => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);

        beforeEach(() => {
            return core.connect().then(() => model.remove()).then(() => model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]));
        });

        after(() => {
            return model.remove().then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.update).to.exist.and.be.a("function");
        });

        it("should use multi update by default",() => {
            return chai.expect(model.update({ _id: { $exists: true } }, { $inc: { answer: 1 } })).to.eventually.equal(5);
        });

        it("should allow multi update to be disabled",() => {
            return chai.expect(model.update({ _id: { $exists: true } }, { $inc: { answer: 1 } }, { multi: false })).to.eventually.equal(1);
        });

        it("should allow just the ID to be specified",() => {
            return model.get().then(instance => {
                return chai.expect(model.update(instance._id, { $inc: { answer: 1 } })).to.eventually.equal(1);
            });
        });

        it("should allow replacement updates to be conducted",() => {
            return model.get().then(instance => {
                instance.answer++;
                return chai.expect(model.update(instance._id, instance.document, { multi: false })).to.eventually.equal(1);
            });
        });

        it("should allow filtering using a selector",() => {
            return chai.expect(model.update({ answer: 10 }, { $inc: { answer: 1 } })).to.eventually.equal(1);
        });

        it("should support a callback style instead of promises",(done) => {
            model.update({}, { $inc: { answer: 1 } }, (err, docs) => {
                if (err) return done(err);
                chai.expect(docs).to.equal(5);
                return done();
            });
        });
    });

    describe("ensureIndex()",() => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);

        beforeEach(() => {
            return core.connect().then(() => model.remove()).then(() => model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]));
        });

        afterEach(() => {
            return model.remove().then(() => model.dropIndexes()).then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.ensureIndex).to.exist.and.be.a("function");
        });

        it("should allow the creation of indexes",() => {
            return chai.expect(model.ensureIndex({ answer: 1 }, { unique: true })).to.eventually.exist;
        });

        it("should allow the use of callbacks instead of promises",(done) => {
            model.ensureIndex({ answer: 1 },(err, index) => {
                if (err) return done(err);
                chai.expect(index).to.exist;
                return done();
            });
        });
    });

    describe("ensureIndexes()", () => {
        let model: Iridium.Model<TestDocument, Test>;

        before(() => {
            Test.indexes = [{ answer: 1 }];
            model = new Iridium.Model<TestDocument, Test>(core, Test);
            return core.connect().then(() => model.remove()).then(() => model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]));
        });

        after(() => {
            Test.indexes = [];
            return model.remove().then(() => model.dropIndexes()).then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.ensureIndexes).to.exist.and.be.a("function");
        });

        it("should configure all indexes defined in the model's options", () => {
            return chai.expect(model.ensureIndexes()).to.eventually.exist.and.have.length(1);
        });
    });

    describe("dropIndex()",() => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);

        beforeEach(() => {
            return core.connect().then(() => model.remove()).then(() => model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ])).then(() => model.ensureIndex({ answer: 1 }));
        });

        afterEach(() => {
            return model.remove().then(() => model.dropIndexes()).then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.dropIndex).to.exist.and.be.a("function");
        });

        it("should remove the specified index",() => {
            return chai.expect(model.dropIndex("answer_1")).to.eventually.be.true;
        });

        it("should remove the specified index using its definition",() => {
            return chai.expect(model.dropIndex({ answer: 1 })).to.eventually.be.true;
        });

        it("should support removing a compound indexe using its definition",() => {
            return chai.expect(model.ensureIndex({ _id: 1, answer: 1 }).then(() => model.dropIndex({ _id: 1, answer: 1 }))).to.eventually.be.true;
        });

        it("should allow the use of callbacks instead of promises",(done) => {
            model.dropIndex({ answer: 1 },(err, index) => {
                if (err) return done(err);
                chai.expect(index).to.be.true;
                return done();
            });
        });
    });

    describe("dropIndexes()",() => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);

        before(() => {
            return core.connect().then(() => model.remove()).then(() => model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ])).then(() => model.ensureIndex({ answer: 1 }));
        });

        after(() => {
            return model.remove().then(() => model.dropIndexes()).then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.dropIndexes).to.exist.and.be.a("function");
        });

        it("should remove all non-_id indexes on the collection",() => {
            return chai.expect(model.dropIndexes()).to.eventually.be.true;
        });
    });

    describe("identifier transforms", () => {
        it("should have a default converter", () => {
            let model = new Iridium.Model<TestDocument, Test>(core, Test);
            chai.expect(model.transforms).to.exist.and.have.property("_id").with.property("fromDB").which.is.a("function");
            chai.expect(model.transforms).to.exist.and.have.property("_id").with.property("toDB").which.is.a("function");
        });

        it("should have a default ObjectID to String converter", () => {
            let model = new Iridium.Model<TestDocument, Test>(core, Test);
            chai.expect(model.transforms["_id"]!.fromDB(MongoDB.ObjectID.createFromHexString("aaaaaaaaaaaaaaaaaaaaaaaa"), "_id", model)).to.eql("aaaaaaaaaaaaaaaaaaaaaaaa");
            chai.expect(model.transforms["_id"]!.toDB("aaaaaaaaaaaaaaaaaaaaaaaa", "_id", model)).to.eql(MongoDB.ObjectID.createFromHexString("aaaaaaaaaaaaaaaaaaaaaaaa"));
        });

        it("should allow you to specify a custom converter by providing a property on the class", () => {
            let model = new Iridium.Model<TestDocument, TestWithCustomID>(core, TestWithCustomID);

            chai.expect(model.transforms["_id"]).to.exist.and.have.property("fromDB").which.is.a("function");
            chai.expect(model.transforms["_id"]).to.exist.and.have.property("toDB").which.is.a("function");

            chai.expect(model.transforms["_id"]!.fromDB(12, "_id", model)).to.eql(120);
            chai.expect(model.transforms["_id"]!.toDB(120, "_id", model)).to.eql(12);
        });
    });
});