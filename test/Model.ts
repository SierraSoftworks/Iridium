/// <reference path="../_references.d.ts" />
import Iridium = require('../index');

interface TestDocument {
    id?: string;
    answer: number;
}

class Test extends Iridium.Instance<TestDocument, Test> implements TestDocument {
    id: string;
    answer: number;
}

describe("Model",() => {
    var core = new Iridium.Core({ database: 'test' });

    before(() => core.connect());

    describe("constructor",() => {
        it("should throw an error if you don't provide a valid core",() => {
            chai.expect(() => {
                new Iridium.Model<any, any>(null,() => { }, 'test', { id: String })
            }).to.throw("You failed to provide a valid Iridium core for this model");
        });

        it("should throw an error if you don't provide a valid instanceType",() => {
            chai.expect(() => {
                new Iridium.Model<any, any>(core, null, 'test', { id: String })
            }).to.throw("You failed to provide a valid instance constructor for this model");
        });

        it("should throw an error if you don't provide a collection name",() => {
            chai.expect(() => {
                new Iridium.Model<any, any>(core,() => { }, null, { id: String })
            }).to.throw("You failed to provide a valid collection name for this model");

            chai.expect(() => {
                new Iridium.Model<any, any>(core,() => { }, '', { id: String })
            }).to.throw("You failed to provide a valid collection name for this model");

            chai.expect(() => {
                new Iridium.Model<any, any>(core,() => { }, <any>4, { id: String })
            }).to.throw("You failed to provide a valid collection name for this model");
        });

        it("should throw an error if you don't provide a valid schema",() => {
            chai.expect(() => {
                new Iridium.Model<any, any>(core,() => { }, 'test', null)
            }).to.throw("You failed to provide a valid schema for this model");

            chai.expect(() => {
                new Iridium.Model<any, any>(core,() => { }, 'test', {})
            }).to.throw("You failed to provide a valid schema for this model");
        });

        it("should correctly set the core",() => {
            chai.expect(new Iridium.Model(core,() => { }, 'test', { id: String }).core).to.equal(core);
        });

        it("should correctly set the collectionName",() => {
            chai.expect(new Iridium.Model(core,() => { }, 'test', { id: String }).collectionName).to.equal('test');
        });

        it("should correctly set the schema",() => {
            chai.expect(new Iridium.Model(core,() => { }, 'test', { id: String }).schema).to.eql({ id: String });
        });
    });

    describe("methods",() => {
        var test = new Iridium.Model(core, Test, 'test', {
            id: String,
            answer: Number
        });

        it("should expose create()",() => chai.expect(test.create).to.exist.and.be.a('function'));
        it("should expose insert()",() => chai.expect(test.insert).to.exist.and.be.a('function'));
        it("should expose remove()",() => chai.expect(test.remove).to.exist.and.be.a('function'));
        it("should expose findOne()",() => chai.expect(test.findOne).to.exist.and.be.a('function'));
        it("should expose get()",() => chai.expect(test.get).to.exist.and.be.a('function'));
        it("should expose find()",() => chai.expect(test.find).to.exist.and.be.a('function'));
        it("should expose count()",() => chai.expect(test.count).to.exist.and.be.a('function'));
        it("should expose ensureIndex()",() => chai.expect(test.ensureIndex).to.exist.and.be.a('function'));
        it("should expose ensureIndexes()",() => chai.expect(test.ensureIndexes).to.exist.and.be.a('function'));
        it("should expose dropIndex()",() => chai.expect(test.dropIndex).to.exist.and.be.a('function'));
        it("should expose dropIndexes()",() => chai.expect(test.dropIndexes).to.exist.and.be.a('function'));
    });

    describe("properties",() => {
        var test = new Iridium.Model(core, Test, 'test', {
            id: String,
            answer: Number
        });

        it("should expose core",() => {
            chai.expect(test).to.have.property('core');
            chai.expect(test.core).to.equal(core);
        });
        it("should expose collection",() => {
            chai.expect(test).to.have.property('collection');
        });
        it("should expose collectionName",() => {
            chai.expect(test).to.have.property('collectionName');
            chai.expect(test.collectionName).to.equal('test');
            test.collectionName = 'changed';
            chai.expect(test.collectionName).to.equal('changed');
        });
        it("should expose options",() => chai.expect(test).to.have.property('options'));
        it("should expose schema",() => chai.expect(test).to.have.property('schema'));
        it("should expose helpers",() => chai.expect(test).to.have.property('helpers'));
        it("should expose handlers",() => chai.expect(test).to.have.property('handlers'));
        it("should expose cache",() => chai.expect(test).to.have.property('cache'));
        it("should expose cacheDirector",() => chai.expect(test).to.have.property('cacheDirector'));
        it("should expose Instance",() => chai.expect(test.Instance).to.exist.and.be.a('function'));
    });
    
    describe("create()",() => {
        var model = new Iridium.Model<TestDocument, Test>(core, Test, 'test', { id: false, answer: Number });

        before(() => {
            return core.connect()
        });

        after(() => {
            return model.remove().then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.create).to.exist.and.be.a('function');
        });

        it("should allow the insertion of a single document",() => {
            return chai.expect(model.create({ answer: 10 })).to.eventually.be.ok;
        });

        it("should return a document if a single document is inserted",() => {
            return chai.expect(model.create({ answer: 10 })).to.eventually.have.property('answer', 10);
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

        it("should support a callback style instead of promises",(done) => {
            model.create({ answer: 15 },(err, inserted) => {
                if (err) return done(err);
                chai.expect(inserted).to.exist.and.have.property('answer', 15);
                return done();
            });
        });
    });

    describe("insert()",() => {
        var model = new Iridium.Model<TestDocument, Test>(core, Test, 'test', { id: false, answer: Number });

        before(() => {
            return core.connect()
        });

        after(() => {
            return model.remove().then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.insert).to.exist.and.be.a('function');
        });

        it("should allow the insertion of a single document",() => {
            return chai.expect(model.insert({ answer: 10 })).to.eventually.be.ok;
        });

        it("should return a document if a single document is inserted",() => {
            return chai.expect(model.insert({ answer: 10 })).to.eventually.have.property('answer', 10);
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

        it("should support a callback style instead of promises",(done) => {
            model.insert({ answer: 15 },(err, inserted) => {
                if (err) return done(err);
                chai.expect(inserted).to.exist.and.have.property('answer', 15);
                return done();
            });
        });
    });

    describe("remove()",() => {
        var model = new Iridium.Model<TestDocument, Test>(core, Test, 'test', { id: false, answer: Number });

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
            chai.expect(model.remove).to.exist.and.be.a('function');
        });

        it("should allow the removal of documents matching a query",() => {
            return chai.expect(model.remove({ answer: 10 })).to.eventually.equal(1);
        });

        it("should allow the removal of all documents",() => {
            return chai.expect(model.remove()).to.eventually.equal(4);
        });

        it("should support a callback style instead of promises",(done) => {
            model.remove((err, removed) => {
                if (err) return done(err);
                chai.expect(removed).to.exist.and.equal(0);
                return done();
            });
        });
    });
    
    describe("findOne()",() => {
        var model = new Iridium.Model<TestDocument, Test>(core, Test, 'test', { id: false, answer: Number });

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
            chai.expect(model.findOne).to.exist.and.be.a('function');
        });

        it("should support retrieving an random document",() => {
            return chai.expect(model.findOne()).to.eventually.exist.and.have.property('answer').is.a('number');
        });

        it("should support retrieving a document using its ID",() => {
            return chai.expect(model.findOne().then((doc) => model.findOne(doc.id))).to.eventually.exist.and.have.property('answer').is.a('number');
        });

        it("should retrieve the correct document by its ID",() => {
            return model.findOne().then((doc) => {
                return chai.expect(model.findOne(doc.id)).to.eventually.exist.and.have.property('id', doc.id);
            });
        });

        it("should support retrieving a document using a selector query",() => {
            return chai.expect(model.findOne({ answer: 10 })).to.eventually.exist.and.have.property('answer', 10);
        });

        it("should support passing options to control the query",() => {
            return chai.expect(model.findOne({}, {
                sort: { answer: -1 }
            })).to.eventually.exist.and.have.property('answer', 14);
        });

        it("should support a callback style instead of promises",(done) => {
            model.findOne((err, doc) => {
                if (err) return done(err);
                chai.expect(doc).to.exist.and.have.property('answer');
                return done();
            });
        });
    });

    describe("get()",() => {
        var model = new Iridium.Model<TestDocument, Test>(core, Test, 'test', { id: false, answer: Number });

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
            chai.expect(model.get).to.exist.and.be.a('function');
        });

        it("should support retrieving an random document",() => {
            return chai.expect(model.get()).to.eventually.exist.and.have.property('answer').is.a('number');
        });

        it("should support retrieving a document using its ID",() => {
            return chai.expect(model.get().then((doc) => model.get(doc.id))).to.eventually.exist.and.have.property('answer').is.a('number');
        });

        it("should retrieve the correct document by its ID",() => {
            return model.get().then((doc) => {
                return chai.expect(model.get(doc.id)).to.eventually.exist.and.have.property('id', doc.id);
            });
        });

        it("should support retrieving a document using a selector query",() => {
            return chai.expect(model.get({ answer: 10 })).to.eventually.exist.and.have.property('answer', 10);
        });

        it("should support passing options to control the query",() => {
            return chai.expect(model.get({}, {
                sort: { answer: -1 }
            })).to.eventually.exist.and.have.property('answer', 14);
        });

        it("should support a callback style instead of promises",(done) => {
            model.get((err, doc) => {
                if (err) return done(err);
                chai.expect(doc).to.exist.and.have.property('answer');
                return done();
            });
        });
    });

    describe("find()",() => {
        var model = new Iridium.Model<TestDocument, Test>(core, Test, 'test', { id: false, answer: Number });

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
            chai.expect(model.find).to.exist.and.be.a('function');
        });

        it("should select all documents by default",() => {
            return chai.expect(model.find()).to.eventually.exist.and.have.length(5);
        });

        it("should allow filtering using a selector",() => {
            return chai.expect(model.find({ answer: 10 })).to.eventually.exist.and.have.length(1);
        });

        it("should allow passing of options to control the query",() => {
            return chai.expect(model.find({}, {
                limit: 2
            })).to.eventually.exist.and.have.length(2);
        });

        it("should support a callback style instead of promises",(done) => {
            model.find((err, docs) => {
                if (err) return done(err);
                chai.expect(docs).to.exist.and.have.length(5);
                return done();
            });
        });
    });

    describe("count()",() => {
        var model = new Iridium.Model<TestDocument, Test>(core, Test, 'test', { id: false, answer: Number });

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
            chai.expect(model.count).to.exist.and.be.a('function');
        });

        it("should select all documents by default",() => {
            return chai.expect(model.count()).to.eventually.exist.and.equal(5);
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

    describe("ensureIndex()",() => {
        var model = new Iridium.Model<TestDocument, Test>(core, Test, 'test', { id: false, answer: Number });

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
            return model.remove().then(() => model.dropIndexes()).then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.ensureIndex).to.exist.and.be.a('function');
        });

        it("should allow the creation of indexes",() => {
            return chai.expect(model.ensureIndex({ answer: 1 }, { unique: true })).to.eventually.exist;
        });
    });

    describe("ensureIndexes()",() => {
        var model = new Iridium.Model<TestDocument, Test>(core, Test, 'test', { id: false, answer: Number }, {
            indexes: [{ answer: 1 }]
        });

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
            return model.remove().then(() => model.dropIndexes()).then(() => core.close());
        });

        it("should exist",() => {
            chai.expect(model.ensureIndexes).to.exist.and.be.a('function');
        });

        it("should configure all indexes defined in the model's options",() => {
            return chai.expect(model.ensureIndexes()).to.eventually.exist.and.have.length(1);
        });
    });

    describe("dropIndex()",() => {
        var model = new Iridium.Model<TestDocument, Test>(core, Test, 'test', { id: false, answer: Number });

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
            chai.expect(model.dropIndex).to.exist.and.be.a('function');
        });

        it("should remove the specified index",() => {
            return chai.expect(model.dropIndex({ answer: 1 })).to.eventually.be.ok;
        });
    });

    describe("dropIndexes()",() => {
        var model = new Iridium.Model<TestDocument, Test>(core, Test, 'test', { id: false, answer: Number });

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
            chai.expect(model.dropIndexes).to.exist.and.be.a('function');
        });

        it("should remove all non-_id indexes on the collection",() => {
            return chai.expect(model.dropIndexes()).to.eventually.be.true;
        });
    });
});