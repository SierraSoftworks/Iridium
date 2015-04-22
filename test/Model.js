var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../_references.d.ts" />
var Iridium = require('../index');
var Test = (function (_super) {
    __extends(Test, _super);
    function Test() {
        _super.apply(this, arguments);
    }
    return Test;
})(Iridium.Instance);
describe("Model", function () {
    var core = new Iridium.Core({ database: 'test' });
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
    var createTests = function () {
        var model = new Iridium.Model(core, Test, 'test', { id: false, answer: Number });
        before(function () {
            return core.connect();
        });
        after(function () {
            return model.remove().then(function () { return core.close(); });
        });
        it("should allow the insertion of a single document", function () {
            return chai.expect(model.create({ answer: 10 })).to.eventually.exist.and.have.property('answer', 10);
        });
        it("should allow the insertion of multiple documents", function () {
            return chai.expect(model.create([
                { answer: 11 },
                { answer: 12 },
                { answer: 13 }
            ])).to.eventually.exist.and.have.lengthOf(3);
        });
        it("should allow you to provide options to control the creation", function () {
            return chai.expect(model.create({ answer: 14 }, { w: 'majority' })).to.eventually.exist;
        });
        it("should support a callback style instead of promises", function (done) {
            model.insert({ answer: 15 }, function (err, inserted) {
                if (err)
                    return done(err);
                chai.expect(inserted).to.exist.and.have.property('answer', 15);
                return done();
            });
        });
    };
    describe("create", createTests);
    describe("insert", createTests);
    describe("remove", function () {
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
    var findOneTests = function () {
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
    };
    describe("findOne", findOneTests);
    describe("get", findOneTests);
    describe("find", function () {
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
        it("should select all documents by default", function () {
            return chai.expect(model.find()).to.eventually.exist.and.have.length(5);
        });
        it("should allow filtering using a selector", function () {
            return chai.expect(model.find({ answer: 10 })).to.eventually.exist.and.have.length(1);
        });
        it("should allow passing of options to control the query", function () {
            return chai.expect(model.find({}, {
                limit: 2
            })).to.eventually.exist.and.have.length(2);
        });
        it("should support a callback style instead of promises", function (done) {
            model.find(function (err, docs) {
                if (err)
                    return done(err);
                chai.expect(docs).to.exist.and.have.length(5);
                return done();
            });
        });
    });
    describe("count", function () {
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
});
//# sourceMappingURL=Model.js.map