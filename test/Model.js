var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../_references.d.ts" />
var Iridium = require('../index');
var Cursor = require('../lib/Cursor');
var Promise = require('bluebird');
var Test = (function (_super) {
    __extends(Test, _super);
    function Test() {
        _super.apply(this, arguments);
    }
    return Test;
})(Iridium.Instance);
describe("Model", function () {
    var core = new Iridium.Core({ database: 'test' });
    before(function () { return core.connect(); });
    describe("constructor", function () {
        it("should throw an error if you don't provide a valid core", function () {
            chai.expect(function () {
                new Iridium.Model(null, function () {
                }, 'test', { id: String });
            }).to.throw("You failed to provide a valid Iridium core for this model");
        });
        it("should throw an error if you don't provide a valid instanceType", function () {
            chai.expect(function () {
                new Iridium.Model(core, null, 'test', { id: String });
            }).to.throw("You failed to provide a valid instance constructor for this model");
        });
        it("should throw an error if you don't provide a collection name", function () {
            chai.expect(function () {
                new Iridium.Model(core, function () {
                }, null, { id: String });
            }).to.throw("You failed to provide a valid collection name for this model");
            chai.expect(function () {
                new Iridium.Model(core, function () {
                }, '', { id: String });
            }).to.throw("You failed to provide a valid collection name for this model");
            chai.expect(function () {
                new Iridium.Model(core, function () {
                }, 4, { id: String });
            }).to.throw("You failed to provide a valid collection name for this model");
        });
        it("should throw an error if you don't provide a valid schema", function () {
            chai.expect(function () {
                new Iridium.Model(core, function () {
                }, 'test', null);
            }).to.throw("You failed to provide a valid schema for this model");
            chai.expect(function () {
                new Iridium.Model(core, function () {
                }, 'test', {});
            }).to.throw("You failed to provide a valid schema for this model");
        });
        it("should correctly set the core", function () {
            chai.expect(new Iridium.Model(core, function () {
            }, 'test', { id: String }).core).to.equal(core);
        });
        it("should correctly set the collectionName", function () {
            chai.expect(new Iridium.Model(core, function () {
            }, 'test', { id: String }).collectionName).to.equal('test');
        });
        it("should correctly set the schema", function () {
            chai.expect(new Iridium.Model(core, function () {
            }, 'test', { id: String }).schema).to.eql({ id: String });
        });
    });
    describe("methods", function () {
        var test = new Iridium.Model(core, Test, 'test', {
            id: String,
            answer: Number
        });
        it("should expose create()", function () { return chai.expect(test.create).to.exist.and.be.a('function'); });
        it("should expose insert()", function () { return chai.expect(test.insert).to.exist.and.be.a('function'); });
        it("should expose remove()", function () { return chai.expect(test.remove).to.exist.and.be.a('function'); });
        it("should expose findOne()", function () { return chai.expect(test.findOne).to.exist.and.be.a('function'); });
        it("should expose get()", function () { return chai.expect(test.get).to.exist.and.be.a('function'); });
        it("should expose find()", function () { return chai.expect(test.find).to.exist.and.be.a('function'); });
        it("should expose count()", function () { return chai.expect(test.count).to.exist.and.be.a('function'); });
        it("should expose ensureIndex()", function () { return chai.expect(test.ensureIndex).to.exist.and.be.a('function'); });
        it("should expose ensureIndexes()", function () { return chai.expect(test.ensureIndexes).to.exist.and.be.a('function'); });
        it("should expose dropIndex()", function () { return chai.expect(test.dropIndex).to.exist.and.be.a('function'); });
        it("should expose dropIndexes()", function () { return chai.expect(test.dropIndexes).to.exist.and.be.a('function'); });
    });
    describe("properties", function () {
        var test = new Iridium.Model(core, Test, 'test', {
            id: String,
            answer: Number
        });
        it("should expose core", function () {
            chai.expect(test).to.have.property('core');
            chai.expect(test.core).to.equal(core);
        });
        it("should expose collection", function () {
            chai.expect(test).to.have.property('collection');
        });
        it("should expose collectionName", function () {
            chai.expect(test).to.have.property('collectionName');
            chai.expect(test.collectionName).to.equal('test');
            test.collectionName = 'changed';
            chai.expect(test.collectionName).to.equal('changed');
        });
        it("should expose options", function () { return chai.expect(test).to.have.property('options'); });
        it("should expose schema", function () { return chai.expect(test).to.have.property('schema'); });
        it("should expose helpers", function () { return chai.expect(test).to.have.property('helpers'); });
        it("should expose handlers", function () { return chai.expect(test).to.have.property('handlers'); });
        it("should expose cache", function () { return chai.expect(test).to.have.property('cache'); });
        it("should expose cacheDirector", function () { return chai.expect(test).to.have.property('cacheDirector'); });
        it("should expose Instance", function () { return chai.expect(test.Instance).to.exist.and.be.a('function'); });
    });
    describe("create()", function () {
        var model = new Iridium.Model(core, Test, 'test', { id: false, answer: Number });
        before(function () {
            return core.connect();
        });
        after(function () {
            return model.remove().then(function () { return core.close(); });
        });
        it("should exist", function () {
            chai.expect(model.create).to.exist.and.be.a('function');
        });
        it("should allow the insertion of a single document", function () {
            return chai.expect(model.create({ answer: 10 })).to.eventually.be.ok;
        });
        it("should return a document if a single document is inserted", function () {
            return chai.expect(model.create({ answer: 10 })).to.eventually.have.property('answer', 10);
        });
        it("should allow the insertion of multiple documents", function () {
            return chai.expect(model.create([
                { answer: 11 },
                { answer: 12 },
                { answer: 13 }
            ])).to.eventually.exist.and.have.lengthOf(3);
        });
        it("should allow you to provide options to control the creation", function () {
            return chai.expect(model.create({ answer: 14 }, { upsert: true })).to.eventually.exist;
        });
        it("should support a callback style instead of promises", function (done) {
            model.create({ answer: 15 }, function (err, inserted) {
                if (err)
                    return done(err);
                chai.expect(inserted).to.exist.and.have.property('answer', 15);
                return done();
            });
        });
    });
    describe("insert()", function () {
        var model = new Iridium.Model(core, Test, 'test', { id: false, answer: Number });
        before(function () {
            return core.connect();
        });
        after(function () {
            return model.remove().then(function () { return core.close(); });
        });
        it("should exist", function () {
            chai.expect(model.insert).to.exist.and.be.a('function');
        });
        it("should allow the insertion of a single document", function () {
            return chai.expect(model.insert({ answer: 10 })).to.eventually.be.ok;
        });
        it("should return a document if a single document is inserted", function () {
            return chai.expect(model.insert({ answer: 10 })).to.eventually.have.property('answer', 10);
        });
        it("should allow the insertion of multiple documents", function () {
            return chai.expect(model.insert([
                { answer: 11 },
                { answer: 12 },
                { answer: 13 }
            ])).to.eventually.exist.and.have.lengthOf(3);
        });
        it("should allow you to provide options to control the creation", function () {
            return chai.expect(model.insert({ answer: 14 }, { upsert: true })).to.eventually.exist;
        });
        it("should support a callback style instead of promises", function (done) {
            model.insert({ answer: 15 }, function (err, inserted) {
                if (err)
                    return done(err);
                chai.expect(inserted).to.exist.and.have.property('answer', 15);
                return done();
            });
        });
    });
    describe("remove()", function () {
        var model = new Iridium.Model(core, Test, 'test', { id: false, answer: Number });
        before(function () {
            return core.connect().then(function () { return model.remove(); }).then(function () { return model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]); });
        });
        after(function () {
            return model.remove().then(function () { return core.close(); });
        });
        it("should exist", function () {
            chai.expect(model.remove).to.exist.and.be.a('function');
        });
        it("should allow the removal of documents matching a query", function () {
            return chai.expect(model.remove({ answer: 10 })).to.eventually.equal(1);
        });
        it("should allow the removal of all documents", function () {
            return chai.expect(model.remove()).to.eventually.equal(4);
        });
        it("should support a callback style instead of promises", function (done) {
            model.remove(function (err, removed) {
                if (err)
                    return done(err);
                chai.expect(removed).to.exist.and.equal(0);
                return done();
            });
        });
    });
    describe("findOne()", function () {
        var model = new Iridium.Model(core, Test, 'test', { id: false, answer: Number });
        before(function () {
            return core.connect().then(function () { return model.remove(); }).then(function () { return model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]); });
        });
        after(function () {
            return model.remove().then(function () { return core.close(); });
        });
        it("should exist", function () {
            chai.expect(model.findOne).to.exist.and.be.a('function');
        });
        it("should support retrieving an random document", function () {
            return chai.expect(model.findOne()).to.eventually.exist.and.have.property('answer').is.a('number');
        });
        it("should support retrieving a document using its ID", function () {
            return chai.expect(model.findOne().then(function (doc) { return model.findOne(doc.id); })).to.eventually.exist.and.have.property('answer').is.a('number');
        });
        it("should retrieve the correct document by its ID", function () {
            return model.findOne().then(function (doc) {
                return chai.expect(model.findOne(doc.id)).to.eventually.exist.and.have.property('id', doc.id);
            });
        });
        it("should support retrieving a document using a selector query", function () {
            return chai.expect(model.findOne({ answer: 10 })).to.eventually.exist.and.have.property('answer', 10);
        });
        it("should support passing options to control the query", function () {
            return chai.expect(model.findOne({}, {
                sort: { answer: -1 }
            })).to.eventually.exist.and.have.property('answer', 14);
        });
        it("should support a callback style instead of promises", function (done) {
            model.findOne(function (err, doc) {
                if (err)
                    return done(err);
                chai.expect(doc).to.exist.and.have.property('answer');
                return done();
            });
        });
    });
    describe("get()", function () {
        var model = new Iridium.Model(core, Test, 'test', { id: false, answer: Number });
        before(function () {
            return core.connect().then(function () { return model.remove(); }).then(function () { return model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]); });
        });
        after(function () {
            return model.remove().then(function () { return core.close(); });
        });
        it("should exist", function () {
            chai.expect(model.get).to.exist.and.be.a('function');
        });
        it("should support retrieving an random document", function () {
            return chai.expect(model.get()).to.eventually.exist.and.have.property('answer').is.a('number');
        });
        it("should support retrieving a document using its ID", function () {
            return chai.expect(model.get().then(function (doc) { return model.get(doc.id); })).to.eventually.exist.and.have.property('answer').is.a('number');
        });
        it("should retrieve the correct document by its ID", function () {
            return model.get().then(function (doc) {
                return chai.expect(model.get(doc.id)).to.eventually.exist.and.have.property('id', doc.id);
            });
        });
        it("should support retrieving a document using a selector query", function () {
            return chai.expect(model.get({ answer: 10 })).to.eventually.exist.and.have.property('answer', 10);
        });
        it("should support passing options to control the query", function () {
            return chai.expect(model.get({}, {
                sort: { answer: -1 }
            })).to.eventually.exist.and.have.property('answer', 14);
        });
        it("should support a callback style instead of promises", function (done) {
            model.get(function (err, doc) {
                if (err)
                    return done(err);
                chai.expect(doc).to.exist.and.have.property('answer');
                return done();
            });
        });
    });
    describe("find()", function () {
        var model = new Iridium.Model(core, Test, 'test', { id: false, answer: Number });
        before(function () {
            return core.connect().then(function () { return model.remove(); }).then(function () { return model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]); });
        });
        after(function () {
            return model.remove().then(function () { return core.close(); });
        });
        it("should exist", function () {
            chai.expect(model.find).to.exist.and.be.a('function');
        });
        it("should return a cursor object", function () {
            chai.expect(model.find()).to.be.an.instanceof(Cursor);
        });
        describe("cursor", function () {
            describe("each()", function () {
                it("should call the handler with each document", function () {
                    return chai.expect(model.find().each(function (instance) {
                        chai.expect(instance).to.exist;
                    })).to.eventually.not.be.rejected;
                });
                it("should return a promise immediately", function () {
                    chai.expect(model.find().each(function (i) {
                    })).to.be.instanceof(Promise);
                });
                it("should resolve the promise after all handlers have been completed", function () {
                    var count = 0;
                    return chai.expect(model.find().each(function (instance) {
                        count++;
                    }).then(function () { return count; })).to.eventually.equal(5);
                });
                it("should support using callbacks instead of promises", function (done) {
                    var count = 0;
                    model.find().each(function (i) { return count++; }, function (err) {
                        if (err)
                            return done(err);
                        chai.expect(count).to.eql(5);
                        return done();
                    });
                });
            });
            describe("map()", function () {
                it("should call the handler with documents", function () {
                    return chai.expect(model.find().map(function (instance) {
                        chai.expect(instance).to.exist;
                    })).to.eventually.not.be.rejected;
                });
                it("should return the values from of each iteration", function () {
                    var count = 0;
                    return chai.expect(model.find().map(function (instance) {
                        return count++;
                    })).to.eventually.be.eql([0, 1, 2, 3, 4]);
                });
                it("should return its result promise immediately", function () {
                    chai.expect(model.find().map(function (i) { return i; })).to.be.instanceof(Promise);
                });
                it("should only resolve its result promise after all results have been resolved", function () {
                    var count = 0;
                    return chai.expect(model.find().map(function (instance) {
                        return count++;
                    }).then(function () { return count; })).to.eventually.equal(5);
                });
                it("should support using callbacks instead of promises", function (done) {
                    var count = 0;
                    model.find().map(function (i) { return count++; }, function (err, results) {
                        if (err)
                            return done(err);
                        chai.expect(results).to.eql([0, 1, 2, 3, 4]);
                        return done();
                    });
                });
            });
            describe("toArray()", function () {
                it("should return all documents", function () {
                    return chai.expect(model.find().toArray()).to.eventually.exist.and.have.length(5);
                });
                it("should support a callback style instead of promises", function (done) {
                    model.find().toArray(function (err, docs) {
                        if (err)
                            return done(err);
                        chai.expect(docs).to.exist.and.have.length(5);
                        return done();
                    });
                });
            });
            describe("count()", function () {
                it("should return a promise", function () {
                    chai.expect(model.find().count()).to.be.instanceof(Promise);
                });
                it("should resolve the promise with the number of documents which match the query", function () {
                    return chai.expect(model.find().count()).to.eventually.be.equal(5);
                });
                it("should support using callbacks instead of promises", function (done) {
                    model.find().count(function (err, count) {
                        if (err)
                            return done(err);
                        chai.expect(count).to.equal(5);
                        return done();
                    });
                });
            });
            describe("limit()", function () {
                it("should return a new cursor", function () {
                    chai.expect(model.find().limit(1)).to.be.instanceof(Cursor);
                });
                it("which should impose the limit", function () {
                    return chai.expect(model.find().limit(2).toArray()).to.eventually.have.length(2);
                });
            });
            describe("skip()", function () {
                it("should return a new cursor", function () {
                    chai.expect(model.find().skip(1)).to.be.instanceof(Cursor);
                });
                it("which should impose the limit", function () {
                    return chai.expect(model.find().skip(2).count()).to.eventually.be.equal(3);
                });
            });
            describe("sort()", function () {
                it("should return a new cursor", function () {
                    chai.expect(model.find().sort({ answer: 1 })).to.be.instanceof(Cursor);
                });
                it("which should perform the sort", function () {
                    return chai.expect(model.find().sort({ answer: -1 }).map(function (i) { return i.answer; })).to.eventually.eql([14, 13, 12, 11, 10]);
                });
            });
        });
        describe("filtering", function () {
            it("should allow filtering using a selector", function () {
                return chai.expect(model.find({ answer: 10 }).toArray()).to.eventually.exist.and.have.length(1);
            });
            it("should transform the conditions", function () {
                return model.get().then(function (instance) { return chai.expect(model.find({
                    id: instance.id
                }).count()).to.eventually.equal(1); });
            });
            it("should allow the returned fields to be restricted", function () {
                return chai.expect(model.find({}, { answer: 0 }).map(function (i) { return i.answer; })).to.eventually.eql([undefined, undefined, undefined, undefined, undefined]);
            });
        });
    });
    describe("count()", function () {
        var model = new Iridium.Model(core, Test, 'test', { id: false, answer: Number });
        before(function () {
            return core.connect().then(function () { return model.remove(); }).then(function () { return model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]); });
        });
        after(function () {
            return model.remove().then(function () { return core.close(); });
        });
        it("should exist", function () {
            chai.expect(model.count).to.exist.and.be.a('function');
        });
        it("should select all documents by default", function () {
            return chai.expect(model.count()).to.eventually.exist.and.equal(5);
        });
        it("should allow filtering using a selector", function () {
            return chai.expect(model.count({ answer: 10 })).to.eventually.exist.and.equal(1);
        });
        it("should support a callback style instead of promises", function (done) {
            model.count(function (err, docs) {
                if (err)
                    return done(err);
                chai.expect(docs).to.exist.and.equal(5);
                return done();
            });
        });
    });
    describe("ensureIndex()", function () {
        var model = new Iridium.Model(core, Test, 'test', { id: false, answer: Number });
        before(function () {
            return core.connect().then(function () { return model.remove(); }).then(function () { return model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]); });
        });
        after(function () {
            return model.remove().then(function () { return model.dropIndexes(); }).then(function () { return core.close(); });
        });
        it("should exist", function () {
            chai.expect(model.ensureIndex).to.exist.and.be.a('function');
        });
        it("should allow the creation of indexes", function () {
            return chai.expect(model.ensureIndex({ answer: 1 }, { unique: true })).to.eventually.exist;
        });
    });
    describe("ensureIndexes()", function () {
        var model = new Iridium.Model(core, Test, 'test', { id: false, answer: Number }, {
            indexes: [{ answer: 1 }]
        });
        before(function () {
            return core.connect().then(function () { return model.remove(); }).then(function () { return model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]); });
        });
        after(function () {
            return model.remove().then(function () { return model.dropIndexes(); }).then(function () { return core.close(); });
        });
        it("should exist", function () {
            chai.expect(model.ensureIndexes).to.exist.and.be.a('function');
        });
        it("should configure all indexes defined in the model's options", function () {
            return chai.expect(model.ensureIndexes()).to.eventually.exist.and.have.length(1);
        });
    });
    describe("dropIndex()", function () {
        var model = new Iridium.Model(core, Test, 'test', { id: false, answer: Number });
        before(function () {
            return core.connect().then(function () { return model.remove(); }).then(function () { return model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]); }).then(function () { return model.ensureIndex({ answer: 1 }); });
        });
        after(function () {
            return model.remove().then(function () { return model.dropIndexes(); }).then(function () { return core.close(); });
        });
        it("should exist", function () {
            chai.expect(model.dropIndex).to.exist.and.be.a('function');
        });
        it("should remove the specified index", function () {
            return chai.expect(model.dropIndex({ answer: 1 })).to.eventually.be.ok;
        });
    });
    describe("dropIndexes()", function () {
        var model = new Iridium.Model(core, Test, 'test', { id: false, answer: Number });
        before(function () {
            return core.connect().then(function () { return model.remove(); }).then(function () { return model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]); }).then(function () { return model.ensureIndex({ answer: 1 }); });
        });
        after(function () {
            return model.remove().then(function () { return model.dropIndexes(); }).then(function () { return core.close(); });
        });
        it("should exist", function () {
            chai.expect(model.dropIndexes).to.exist.and.be.a('function');
        });
        it("should remove all non-_id indexes on the collection", function () {
            return chai.expect(model.dropIndexes()).to.eventually.be.true;
        });
    });
});
//# sourceMappingURL=Model.js.map