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
    Test.prototype.test = function () {
        return true;
    };
    Object.defineProperty(Test.prototype, "ansqr", {
        get: function () {
            return this.answer * this.answer;
        },
        enumerable: true,
        configurable: true
    });
    return Test;
})(Iridium.Instance);
var TestDB = (function (_super) {
    __extends(TestDB, _super);
    function TestDB() {
        _super.call(this, "mongodb://localhost/test");
        this.Test = new Iridium.Model(this, Test, 'test', {
            id: false,
            answer: Number,
            lots: { $required: false, $type: [Number] },
            less: { $required: false, $propertyType: Number }
        });
    }
    return TestDB;
})(Iridium.Core);
describe("Instance", function () {
    var core = new TestDB();
    before(function () { return core.connect(); });
    after(function () { return core.close(); });
    beforeEach(function () { return core.Test.remove(); });
    it("should expose the latest document values", function () {
        var instance = core.Test.helpers.wrapDocument({
            id: 'aaaaaa',
            answer: 2
        });
        chai.expect(instance).to.exist;
        chai.expect(instance.answer).to.be.equal(2);
        chai.expect(instance.id).to.be.equal('aaaaaa');
    });
    describe("methods", function () {
        it("should expose save()", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).save).to.exist.and.be.a('function');
        });
        it("should expose update()", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).update).to.exist.and.be.a('function');
        });
        it("should expose refresh()", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).refresh).to.exist.and.be.a('function');
        });
        it("should expose delete()", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).delete).to.exist.and.be.a('function');
        });
        it("should expose remove()", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).remove).to.exist.and.be.a('function');
        });
        it("should override toJSON()", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).toJSON()).to.eql({ id: '1', answer: 2 });
        });
        it("should override toString()", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).toString()).to.eql(JSON.stringify({ id: '1', answer: 2 }, null, 2));
        });
    });
    describe("properties", function () {
        it("should expose document", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).document).to.eql({ id: '1', answer: 2 });
        });
    });
    it("should expose additional getters and setters", function () {
        var instance = core.Test.helpers.wrapDocument({
            id: 'aaaaaa',
            answer: 2
        });
        chai.expect(instance).to.exist;
        chai.expect(instance.ansqr).to.exist.and.be.equal(4);
    });
    it("should expose additional methods", function () {
        var instance = core.Test.helpers.wrapDocument({
            id: 'aaaaaa',
            answer: 2
        });
        chai.expect(instance).to.exist;
        chai.expect(instance.test).to.exist.and.be.a('function');
    });
    describe("save()", function () {
        beforeEach(function () { return core.Test.remove(); });
        it("should avoid making calls to the database if no changes were made to the instance", function () {
            var update = core.Test.collection.update;
            core.Test.collection.update = function () {
                chai.assert.fail();
            };
            return core.Test.insert({
                answer: 1
            }).then(function () { return chai.expect(core.Test.get().then(function (instance) {
                return instance.save().then(function () {
                    core.Test.collection.update = update;
                });
            })); });
        });
        it("should insert the instance if it is not present in the database", function () {
            var instance = new core.Test.Instance({
                answer: 1
            });
            chai.expect(instance._isNew).to.be.true;
            return chai.expect(instance.save().then(function () { return chai.expect(core.Test.get(instance.id)).to.eventually.have.property('answer', instance.answer); })).to.eventually.be.ok;
        });
        it("should automatically generate the update query if one was not provided", function () {
            return core.Test.insert({
                answer: 1
            }).then(function () { return chai.expect(core.Test.get().then(function (instance) {
                instance.answer = 42;
                return instance.save().then(function () { return core.Test.get(instance.id); });
            })).to.eventually.have.property('answer', 42); });
        });
        it("should allow you to specify a custom update query", function () {
            return core.Test.insert({
                answer: 1
            }).then(function () { return core.Test.get(); }).then(function (instance) { return chai.expect(instance.save({ $set: { answer: 10 } })).to.eventually.have.property('answer', 10); });
        });
        it("should allow you tp specify a custom update query and conditions for the update", function () {
            return core.Test.insert({
                answer: 1
            }).then(function () { return core.Test.get(); }).then(function (instance) { return chai.expect(instance.save({ answer: { $lt: 5 } }, { $set: { answer: 10 } })).to.eventually.have.property('answer', 10); });
        });
        it("should return a promise for the instance", function () {
            return core.Test.insert({
                answer: 1
            }).then(function () { return core.Test.get(); }).then(function (instance) { return chai.expect(instance.save()).to.eventually.equal(instance); });
        });
        it("should allow the use of a callback instead of promises", function (done) {
            core.Test.insert({
                answer: 1
            }).then(function () { return core.Test.get(); }).then(function (instance) {
                instance.save(function (err, result) {
                    if (err)
                        return done(err);
                    chai.expect(result).to.equal(instance);
                    return done();
                });
            });
        });
    });
    describe("update()", function () {
        beforeEach(function () { return core.Test.remove().then(function () { return core.Test.insert({ answer: 1 }); }); });
        it("should not replace the instance", function () {
            return core.Test.get().then(function (instance) { return chai.expect(instance.update()).to.eventually.equal(instance); });
        });
        it("should update the instance's properties", function () {
            return chai.expect(core.Test.get().then(function (instance) {
                return core.Test.update({ id: instance.id }, {
                    $set: { answer: 10 }
                }).then(function () { return instance.update(); });
            })).to.eventually.have.property('answer', 10);
        });
        it("should set _isNew to true if the instance was removed from the database", function () {
            return core.Test.get().then(function (instance) {
                core.Test.remove().then(function () { return instance.update(); }).then(function () { return chai.expect(instance._isNew).to.be.true; });
            });
        });
        it("should return a promise for the instance", function () {
            return core.Test.get().then(function (instance) {
                core.Test.update({ id: instance.id }, {
                    $set: { answer: 10 }
                }).then(function () { return chai.expect(instance.update()).to.eventually.equal(instance); });
            });
        });
        it("should allow the use of a callback instead of promises", function (done) {
            core.Test.get().then(function (instance) {
                instance.update(function (err, result) {
                    if (err)
                        return done(err);
                    chai.expect(result).to.equal(instance);
                    return done();
                });
            });
        });
    });
    describe("refresh()", function () {
        beforeEach(function () { return core.Test.remove().then(function () { return core.Test.insert({ answer: 1 }); }); });
        it("should not replace the instance", function () {
            return core.Test.get().then(function (instance) { return chai.expect(instance.update()).to.eventually.equal(instance); });
        });
        it("should update the instance's properties", function () {
            return chai.expect(core.Test.get().then(function (instance) {
                return core.Test.update({ id: instance.id }, {
                    $set: { answer: 10 }
                }).then(function () { return instance.refresh(); });
            })).to.eventually.have.property('answer', 10);
        });
        it("should set _isNew to true if the instance was removed from the database", function () {
            return core.Test.get().then(function (instance) {
                core.Test.remove().then(function () { return instance.refresh(); }).then(function () { return chai.expect(instance._isNew).to.be.true; });
            });
        });
        it("should return a promise for the instance", function () {
            return core.Test.get().then(function (instance) {
                core.Test.update({ id: instance.id }, {
                    $set: { answer: 10 }
                }).then(function () { return chai.expect(instance.refresh()).to.eventually.equal(instance); });
            });
        });
        it("should allow the use of a callback instead of promises", function (done) {
            core.Test.get().then(function (instance) {
                instance.refresh(function (err, result) {
                    if (err)
                        return done(err);
                    chai.expect(result).to.equal(instance);
                    return done();
                });
            });
        });
    });
    describe("remove()", function () {
        beforeEach(function () { return core.Test.remove().then(function () { return core.Test.insert({ answer: 1 }); }); });
        it("should remove the document from the database", function () {
            return chai.expect(core.Test.get().then(function (instance) { return instance.remove(); }).then(function () { return core.Test.get(); })).to.eventually.be.null;
        });
        it("should set the instance's isNew property to true", function () {
            return chai.expect(core.Test.get().then(function (instance) { return instance.remove(); })).to.eventually.have.property('_isNew', true);
        });
        it("should return a promise for the instance", function () {
            return core.Test.get().then(function (instance) { return chai.expect(instance.remove()).to.eventually.equal(instance); });
        });
        it("shouldn't mind if the object has already been removed", function () {
            return core.Test.get().then(function (instance) {
                return chai.expect(core.Test.remove().then(function () { return instance.remove(); })).to.eventually.not.be.rejected;
            });
        });
        it("should be a no-op if the object is marked as _isNew", function () {
            return core.Test.get().then(function (instance) {
                var newInstance = new core.Test.Instance(instance.document);
                return newInstance.remove();
            }).then(function () { return chai.expect(core.Test.count()).to.eventually.equal(1); });
        });
        it("should allow the use of a callback instead of promises", function (done) {
            core.Test.get().then(function (instance) {
                instance.remove(function (err, result) {
                    if (err)
                        return done(err);
                    chai.expect(result).to.equal(instance);
                    return done();
                });
            });
        });
    });
    describe("delete()", function () {
        beforeEach(function () { return core.Test.remove().then(function () { return core.Test.insert({ answer: 1 }); }); });
        it("should remove the document from the database", function () {
            return chai.expect(core.Test.get().then(function (instance) { return instance.delete(); }).then(function () { return core.Test.get(); })).to.eventually.be.null;
        });
        it("should set the instance's isNew property to true", function () {
            return chai.expect(core.Test.get().then(function (instance) { return instance.delete(); })).to.eventually.have.property('_isNew', true);
        });
        it("should return a promise for the instance", function () {
            return core.Test.get().then(function (instance) { return chai.expect(instance.delete()).to.eventually.equal(instance); });
        });
        it("shouldn't mind if the object has already been removed", function () {
            return core.Test.get().then(function (instance) {
                return chai.expect(core.Test.remove().then(function () { return instance.delete(); })).to.eventually.not.be.rejected;
            });
        });
        it("should allow the use of a callback instead of promises", function (done) {
            core.Test.get().then(function (instance) {
                instance.delete(function (err, result) {
                    if (err)
                        return done(err);
                    chai.expect(result).to.equal(instance);
                    return done();
                });
            });
        });
    });
    describe("first()", function () {
        beforeEach(function () { return core.Test.remove().then(function () { return core.Test.insert({ answer: 1, lots: [1, 2, 3, 4], less: { 'a': 1, 'b': 2 } }); }); });
        it("should return the first object which matches the predicate over an array", function () {
            return chai.expect(core.Test.get().then(function (instance) { return instance.first(instance.lots, function (lot) { return lot == 2; }); })).to.eventually.equal(2);
        });
        it("should return the first object which matches the predicate over an object", function () {
            return chai.expect(core.Test.get().then(function (instance) { return instance.first(instance.less, function (value, key) { return key == 'a'; }); })).to.eventually.equal(1);
        });
        it("should return null if no item was found", function () {
            return chai.expect(core.Test.get().then(function (instance) { return instance.first(instance.lots, function (lot) { return lot > 100; }); })).to.eventually.be.null;
        });
    });
    describe("select()", function () {
        beforeEach(function () { return core.Test.remove().then(function () { return core.Test.insert({ answer: 1, lots: [1, 2, 3, 4], less: { 'a': 1, 'b': 2 } }); }); });
        it("should return the objects which match the predicate over an array", function () {
            return chai.expect(core.Test.get().then(function (instance) { return instance.select(instance.lots, function (lot) { return lot > 2; }); })).to.eventually.eql([3, 4]);
        });
        it("should return the properties which match the predicate over an object", function () {
            return chai.expect(core.Test.get().then(function (instance) { return instance.select(instance.less, function (value, key) { return key == 'a'; }); })).to.eventually.eql({ 'a': 1 });
        });
        it("should return an empty array if no items matched over an array", function () {
            return chai.expect(core.Test.get().then(function (instance) { return instance.select(instance.lots, function (lot) { return lot > 100; }); })).to.eventually.be.eql([]);
        });
        it("should return an empty object if no items matched over an object", function () {
            return chai.expect(core.Test.get().then(function (instance) { return instance.select(instance.less, function (lot) { return lot > 100; }); })).to.eventually.be.eql({});
        });
    });
});
//# sourceMappingURL=Instance.js.map