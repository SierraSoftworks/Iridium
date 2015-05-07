var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../_references.d.ts" />
var Iridium = require('../index');
var MongoDB = require('mongodb');
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
                new Iridium.Model(null, function () { }, 'test', { _id: false });
            }).to.throw("You failed to provide a valid Iridium core for this model");
        });
        it("should throw an error if you don't provide a valid instanceType", function () {
            chai.expect(function () {
                new Iridium.Model(core, null, 'test', { _id: false });
            }).to.throw("You failed to provide a valid instance constructor for this model");
        });
        it("should throw an error if you don't provide a collection name", function () {
            chai.expect(function () {
                new Iridium.Model(core, function () { }, null, { _id: false });
            }).to.throw("You failed to provide a valid collection name for this model");
            chai.expect(function () {
                new Iridium.Model(core, function () { }, '', { _id: false });
            }).to.throw("You failed to provide a valid collection name for this model");
            chai.expect(function () {
                new Iridium.Model(core, function () { }, 4, { _id: false });
            }).to.throw("You failed to provide a valid collection name for this model");
        });
        it("should throw an error if you don't provide a valid schema", function () {
            chai.expect(function () {
                new Iridium.Model(core, function () { }, 'test', null);
            }).to.throw("You failed to provide a valid schema for this model");
            chai.expect(function () {
                new Iridium.Model(core, function () { }, 'test', { id: false });
            }).to.throw("You failed to provide a valid schema for this model");
        });
        it("should correctly set the core", function () {
            chai.expect(new Iridium.Model(core, function () { }, 'test', { _id: false }).core).to.equal(core);
        });
        it("should correctly set the collectionName", function () {
            chai.expect(new Iridium.Model(core, function () { }, 'test', { _id: false }).collectionName).to.equal('test');
        });
        it("should correctly set the schema", function () {
            chai.expect(new Iridium.Model(core, function () { }, 'test', { _id: false }).schema).to.eql({ _id: false });
        });
    });
    describe("methods", function () {
        var test = new Iridium.Model(core, Test, 'test', {
            _id: false,
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
            _id: false,
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
    describe("collection", function () {
        it("should throw an error if you attempt to access it before connecting to the database", function () {
            var model = new Iridium.Model(new Iridium.Core('mongodb://localhost/test'), function () { }, 'test', { _id: false });
            chai.expect(function () { return model.collection; }).to.throw("Iridium Core not connected to a database.");
        });
        it("should return a MongoDB DB object", function () {
            chai.expect(core.connection).to.exist.and.be.an.instanceof(MongoDB.Db);
        });
    });
    describe("create()", function () {
        var model = new Iridium.Model(core, Test, 'test', { _id: false, answer: Number });
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
        var model = new Iridium.Model(core, Test, 'test', { _id: false, answer: Number });
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
        var model = new Iridium.Model(core, Test, 'test', { _id: false, answer: Number });
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
        it("should allow just the ID to be specified", function () {
            return model.get().then(function (instance) {
                return chai.expect(model.remove(instance._id)).to.eventually.exist.and.equal(1);
            });
        });
        it("should allow the removal of all documents", function () {
            return chai.expect(model.remove()).to.eventually.equal(3);
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
        var model = new Iridium.Model(core, Test, 'test', { _id: false, answer: Number });
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
            return chai.expect(model.findOne().then(function (doc) { return model.findOne(doc._id); })).to.eventually.exist.and.have.property('answer').is.a('number');
        });
        it("should retrieve the correct document by its ID", function () {
            return model.findOne().then(function (doc) {
                return chai.expect(model.findOne(doc._id)).to.eventually.exist.and.have.property('_id', doc._id);
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
        it("should allow you to limit the returned fields", function () {
            return chai.expect(model.findOne({}, {
                fields: { answer: 0 }
            }).then(function (instance) { return instance.answer; })).to.eventually.be.undefined;
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
        var model = new Iridium.Model(core, Test, 'test', { _id: false, answer: Number });
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
            return chai.expect(model.get().then(function (doc) { return model.get(doc._id); })).to.eventually.exist.and.have.property('answer').is.a('number');
        });
        it("should retrieve the correct document by its ID", function () {
            return model.get().then(function (doc) {
                return chai.expect(model.get(doc._id)).to.eventually.exist.and.have.property('_id', doc._id);
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
        it("should allow you to limit the returned fields", function () {
            return chai.expect(model.get({}, {
                fields: { answer: 0 }
            }).then(function (instance) { return instance.answer; })).to.eventually.be.undefined;
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
        var model = new Iridium.Model(core, Test, 'test', { _id: false, answer: Number });
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
        describe("each()", function () {
            it("should call the handler with each document", function () {
                return chai.expect(model.find().forEach(function (instance) {
                    chai.expect(instance).to.exist;
                })).to.eventually.not.be.rejected;
            });
            it("should return a promise immediately", function () {
                chai.expect(model.find().forEach(function (i) { })).to.be.instanceof(Promise);
            });
            it("should resolve the promise after all handlers have been dispatched", function () {
                var count = 0;
                return chai.expect(model.find().forEach(function (instance) {
                    count++;
                }).then(function () { return chai.expect(count).to.not.equal(5); }).then(function () { return Promise.delay(10); }).then(function () { return count; })).to.eventually.equal(5);
            });
            it("should support using callbacks instead of promises", function (done) {
                var count = 0;
                model.find().forEach(function (i) { return count++; }, function (err) {
                    if (err)
                        return done(err);
                    Promise.delay(10).then(function () { return chai.expect(count).to.eql(5); }).then(function () { return done(); });
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
        describe("next()", function () {
            it("should return a promise", function () {
                chai.expect(model.find().next()).to.be.an.instanceof(Promise);
            });
            it("which should resolve to the next instance in the query", function () {
                return chai.expect(model.find().next()).to.eventually.be.an.instanceof(model.Instance);
            });
            it("should support using callbacks instead of promises", function (done) {
                model.find().next(function (err, instance) {
                    if (err)
                        return done(err);
                    chai.expect(instance).to.be.an.instanceof(model.Instance);
                    return done();
                });
            });
        });
        describe("rewind()", function () {
            it("should return a new cursor", function () {
                chai.expect(model.find().rewind()).to.be.an.instanceof(Cursor);
            });
            it("which should start returning items from the start of the query", function () {
                var cursor = model.find();
                return cursor.next().then(function (firstItem) { return cursor.rewind().next().then(function (rewoundItem) { return chai.expect(firstItem.document).to.eql(rewoundItem.document); }); });
            });
            it("should carry through any other attributes", function () {
                var cursor = model.find().sort({ answer: -1 }).limit(2);
                return chai.expect(cursor.toArray().then(function () { return cursor.rewind().map(function (i) { return i.answer; }); })).to.eventually.eql([14, 13]);
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
        describe("filtering", function () {
            it("should allow filtering using a selector", function () {
                return chai.expect(model.find({ answer: 10 }).toArray()).to.eventually.exist.and.have.length(1);
            });
            it("should allow an ID to be specified directly", function () {
                return model.find({ answer: 10 }).next().then(function (instance) { return chai.expect(model.find(instance._id).count()).to.eventually.equal(1); });
            });
            it("should transform the conditions", function () {
                return model.get().then(function (instance) { return chai.expect(model.find({
                    _id: instance._id
                }).count()).to.eventually.equal(1); });
            });
            it("should allow the returned fields to be restricted", function () {
                return chai.expect(model.find({}, { answer: 0 }).map(function (i) { return i.answer; })).to.eventually.eql([undefined, undefined, undefined, undefined, undefined]);
            });
        });
    });
    describe("count()", function () {
        var model = new Iridium.Model(core, Test, 'test', { _id: false, answer: Number });
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
        it("should allow just the ID to be specified", function () {
            return model.get().then(function (instance) {
                return chai.expect(model.count(instance._id)).to.eventually.exist.and.equal(1);
            });
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
    describe("update()", function () {
        var model = new Iridium.Model(core, Test, 'test', { _id: false, answer: Number });
        beforeEach(function () {
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
            chai.expect(model.update).to.exist.and.be.a('function');
        });
        it("should use multi update by default", function () {
            return chai.expect(model.update({ _id: { $exists: true } }, { $inc: { answer: 1 } })).to.eventually.equal(5);
        });
        it("should allow just the ID to be specified", function () {
            return model.get().then(function (instance) {
                return chai.expect(model.update(instance._id, { $inc: { answer: 1 } })).to.eventually.equal(1);
            });
        });
        it("should allow filtering using a selector", function () {
            return chai.expect(model.update({ answer: 10 }, { $inc: { answer: 1 } })).to.eventually.equal(1);
        });
        it("should support a callback style instead of promises", function (done) {
            model.update({}, { $inc: { answer: 1 } }, function (err, docs) {
                if (err)
                    return done(err);
                chai.expect(docs).to.equal(5);
                return done();
            });
        });
    });
    describe("ensureIndex()", function () {
        var model = new Iridium.Model(core, Test, 'test', { _id: false, answer: Number });
        beforeEach(function () {
            return core.connect().then(function () { return model.remove(); }).then(function () { return model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]); });
        });
        afterEach(function () {
            return model.remove().then(function () { return model.dropIndexes(); }).then(function () { return core.close(); });
        });
        it("should exist", function () {
            chai.expect(model.ensureIndex).to.exist.and.be.a('function');
        });
        it("should allow the creation of indexes", function () {
            return chai.expect(model.ensureIndex({ answer: 1 }, { unique: true })).to.eventually.exist;
        });
        it("should allow the use of callbacks instead of promises", function (done) {
            model.ensureIndex({ answer: 1 }, function (err, index) {
                if (err)
                    return done(err);
                chai.expect(index).to.exist;
                return done();
            });
        });
    });
    describe("ensureIndexes()", function () {
        var model = new Iridium.Model(core, Test, 'test', { _id: false, answer: Number }, {
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
        var model = new Iridium.Model(core, Test, 'test', { _id: false, answer: Number });
        beforeEach(function () {
            return core.connect().then(function () { return model.remove(); }).then(function () { return model.insert([
                { answer: 10 },
                { answer: 11 },
                { answer: 12 },
                { answer: 13 },
                { answer: 14 }
            ]); }).then(function () { return model.ensureIndex({ answer: 1 }); });
        });
        afterEach(function () {
            return model.remove().then(function () { return model.dropIndexes(); }).then(function () { return core.close(); });
        });
        it("should exist", function () {
            chai.expect(model.dropIndex).to.exist.and.be.a('function');
        });
        it("should remove the specified index", function () {
            return chai.expect(model.dropIndex('answer_1')).to.eventually.be.true;
        });
        it("should remove the specified index using its definition", function () {
            return chai.expect(model.dropIndex({ answer: 1 })).to.eventually.be.true;
        });
        it("should support removing a compound indexe using its definition", function () {
            return chai.expect(model.ensureIndex({ _id: 1, answer: 1 }).then(function () { return model.dropIndex({ _id: 1, answer: 1 }); })).to.eventually.be.true;
        });
        it("should allow the use of callbacks instead of promises", function (done) {
            model.dropIndex({ answer: 1 }, function (err, index) {
                if (err)
                    return done(err);
                chai.expect(index).to.be.true;
                return done();
            });
        });
    });
    describe("dropIndexes()", function () {
        var model = new Iridium.Model(core, Test, 'test', { _id: false, answer: Number });
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