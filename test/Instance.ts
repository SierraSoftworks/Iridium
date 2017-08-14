import * as Iridium from "../iridium";
import * as MongoDB from "mongodb";
import * as chai from "chai";

interface TestDocument {
    _id?: string;
    answer: number;
    lots?: number[];
    less?: { [key: string]: number };
}

class Test extends Iridium.Instance<TestDocument, Test> implements TestDocument {
    static collection = "test";
    static schema: Iridium.Schema = {
        _id: false,
        answer: Number,
        lots: { $required: false, $type: [Number] },
        less: { $required: false, $propertyType: Number }
    };

    _id: string;
    answer: number;
    lots: number[];
    less: { [key: string]: number };

    test() {
        return true;
    }

    get ansqr() {
        return this.answer * this.answer;
    }
}

class TestDB extends Iridium.Core {
    constructor() {
        super("mongodb://localhost/test");
    }

    Test = new Iridium.Model<TestDocument, Test>(this, Test);
}

describe("Instance",() => {
    let core = new TestDB();

    before(() => core.connect());
    after(() => core.close());

    beforeEach(() => core.Test.remove());

    it("should default to isNew",() => {
        let instance = new core.Test.Instance({
            answer: 42
        });

        chai.expect(instance).to.have.property("_isNew", true);
    });

    it("should default to !isPartial",() => {
        let instance = new core.Test.Instance({
            answer: 42
        });

        chai.expect(instance).to.have.property("_isPartial", false);
    });

    it("should expose the latest document values",() => {
        let instance = core.Test.helpers.wrapDocument({
            _id: "aaaaaa",
            answer: 2
        });

        chai.expect(instance).to.exist;
        chai.expect(instance.answer).to.be.equal(2);
        chai.expect(instance._id).to.be.equal("aaaaaa");
    });

    describe("methods",() => {
        it("should expose save()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ _id: "1", answer: 2 }).save).to.exist.and.be.a("function");
        });

        it("should expose update()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ _id: "1", answer: 2 }).update).to.exist.and.be.a("function");
        });

        it("should expose refresh()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ _id: "1", answer: 2 }).refresh).to.exist.and.be.a("function");
        });

        it("should expose delete()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ _id: "1", answer: 2 }).delete).to.exist.and.be.a("function");
        });

        it("should expose remove()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ _id: "1", answer: 2 }).remove).to.exist.and.be.a("function");
        });

        it("should override toJSON()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ _id: "1", answer: 2 }).toJSON()).to.eql({ _id: "1", answer: 2 });
        });

        it("should override toString()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ _id: "1", answer: 2 }).toString()).to.eql(JSON.stringify({ _id: "1", answer: 2 }, null, 2));
        });
    });

    describe("properties",() => {
        it("should expose document",() => {
            chai.expect(core.Test.helpers.wrapDocument({ _id: "1", answer: 2 }).document).to.eql({ _id: "1", answer: 2 });
        });
    });

    it("should expose additional getters and setters",() => {
        let instance = core.Test.helpers.wrapDocument({
            _id: "aaaaaa",
            answer: 2
        });

        chai.expect(instance).to.exist;
        chai.expect(instance.ansqr).to.exist.and.be.equal(4);
    });

    it("should expose additional methods",() => {
        let instance = core.Test.helpers.wrapDocument({
            _id: "aaaaaa",
            answer: 2
        });

        chai.expect(instance).to.exist;
        chai.expect(instance.test).to.exist.and.be.a("function");
    });

    describe("should handle _id in a special manner",() => {
        beforeEach(() => core.Test.remove().then(() => core.Test.insert({ answer: 42 })));
        afterEach(() => core.Test.remove());

        it("get should transform ObjectIDs into hex strings",() => {
            return core.Test.get().then(instance => {
                chai.expect((<any>instance.document._id)._bsontype).to.equal("ObjectID");
                chai.expect(instance._id).to.be.a("string").with.length(24);
            });
        });

        it("set should transform hex strings into ObjectIDs by default",() => {
            return core.Test.get().then(instance => {
                instance._id = "aaaaaaaaaaaaaaaaaaaaaaaa";
                chai.expect(new MongoDB.ObjectID(instance.document._id).toHexString()).to.equal("aaaaaaaaaaaaaaaaaaaaaaaa");
            });
        });
    });

    describe("save()",() => {

        beforeEach(() => core.Test.remove());

        it("should avoid making calls to the database if no changes were made to the instance",() => {
            let update = core.Test.collection.updateOne;
            core.Test.collection.updateOne = (...args: any[]) => {
                chai.assert.fail();
                return update.apply(core.Test.collection, args);
            };

            return core.Test.insert({
                answer: 1
            }).then(() => core.Test.get()).then(instance => instance.save()).then(() => {
                core.Test.collection.updateOne = update;
            });
        });

        it("should insert the instance if it is not present in the database",() => {
            let instance = new core.Test.Instance({
                answer: 1
            });

            chai.expect((<any>instance)._isNew).to.be.true;
            return chai.expect(instance.save().then(() => chai.expect(core.Test.get(instance._id)).to.eventually.have.property("answer", instance.answer))).to.eventually.be.ok;
        });

        it("should set isNew to false after inserting a new instance",() => {
            let instance = new core.Test.Instance({
                answer: 1
            });

            chai.expect((<any>instance)._isNew).to.be.true;
            return instance.save().then(() => chai.expect((<any>instance)._isNew).to.be.false);
        });

        it("should allow a new instance to be saved on insertion, modified and saved again",() => {
            let instance = new core.Test.Instance({
                answer: 1
            });

            return chai.expect(instance.save().then(() => {
                instance.answer = 2;
                return instance.save();
            })).to.eventually.not.be.rejected;
        });

        it("should automatically generate the update query if one was not provided",() => {
            return core.Test.insert({
                answer: 1
            }).then(() => chai.expect(core.Test.get().then((instance) => {
                instance.answer = 42;
                return instance.save().then(() => core.Test.get(instance._id));
            })).to.eventually.have.property("answer", 42));
        });

        it("should allow you to specify a custom update query",() => {
            return core.Test.insert({
                answer: 1
            })
                .then(() => core.Test.get())
                .then((instance) => chai.expect(instance.save({ $set: { answer: 10 } })).to.eventually.have.property("answer", 10));
        });

        it("should allow you to specify a custom update query and conditions for the update",() => {
            return core.Test.insert({
                answer: 1
            })
                .then(() => core.Test.get())
                .then((instance) => chai.expect(instance.save({ answer: { $lt: 5 } }, { $set: { answer: 10 } })).to.eventually.have.property("answer", 10));
        });

        it("should return a promise for the instance",() => {
            return core.Test.insert({
                answer: 1
            })
                .then(() => core.Test.get())
                .then((instance) => chai.expect(instance.save()).to.eventually.equal(instance));
        });

        it("should allow the use of a callback instead of promises",(done) => {
            core.Test.insert({
                answer: 1
            })
                .then(() => core.Test.get())
                .then((instance) => {
                instance.save((err, result) => {
                    if (err) return done(err);
                    chai.expect(result).to.equal(instance);
                    return done();
                });
            });
        });
    });

    describe("update()",() => {
        beforeEach(() => core.Test.remove().then(() => core.Test.insert({ answer: 1 })));

        it("should not replace the instance",() => {
            return core.Test.get().then((instance) => chai.expect(instance.update()).to.eventually.equal(instance));
        });

        it("should update the instance's properties",() => {
            return chai.expect(core.Test.get().then((instance) => {
                return core.Test.update({ _id: instance._id }, {
                    $set: { answer: 10 }
                }).then(() => instance.update());
            })).to.eventually.have.property("answer", 10);
        });

        it("should set _isNew to true if the instance was removed from the database",() => {
            return core.Test.get().then(instance => {
                core.Test.remove().then(() => instance.update()).then(() => chai.expect((<any>instance)._isNew).to.be.true);
            });
        });

        it("should return a promise for the instance",() => {
            return core.Test.get().then((instance) => {
                core.Test.update({ _id: instance._id }, {
                    $set: { answer: 10 }
                }).then(() => chai.expect(instance.update()).to.eventually.equal(instance));
            });
        });

        it("should allow the use of a callback instead of promises",(done) => {
            core.Test.get().then((instance) => {
                instance.update((err, result) => {
                    if (err) return done(err);
                    chai.expect(result).to.equal(instance);
                    return done();
                });
            });
        });
    });

    describe("refresh()",() => {
        beforeEach(() => core.Test.remove().then(() => core.Test.insert({ answer: 1 })));

        it("should not replace the instance",() => {
            return core.Test.get().then((instance) => chai.expect(instance.update()).to.eventually.equal(instance));
        });

        it("should update the instance's properties",() => {
            return chai.expect(core.Test.get().then((instance) => {
                return core.Test.update({ _id: instance._id }, {
                    $set: { answer: 10 }
                }).then(() => instance.refresh());
            })).to.eventually.have.property("answer", 10);
        });

        it("should set _isNew to true if the instance was removed from the database",() => {
            return core.Test.get().then(instance => {
                core.Test.remove().then(() => instance.refresh()).then(() => chai.expect((<any>instance)._isNew).to.be.true);
            });
        });

        it("should return a promise for the instance",() => {
            return core.Test.get().then((instance) => {
                core.Test.update({ _id: instance._id }, {
                    $set: { answer: 10 }
                }).then(() => chai.expect(instance.refresh()).to.eventually.equal(instance));
            });
        });

        it("should allow the use of a callback instead of promises",(done) => {
            core.Test.get().then((instance) => {
                instance.refresh((err, result) => {
                    if (err) return done(err);
                    chai.expect(result).to.equal(instance);
                    return done();
                });
            });
        });
    });

    describe("remove()",() => {
        beforeEach(() => core.Test.remove().then(() => core.Test.insert({ answer: 1 })));

        it("should remove the document from the database",() => {
            return chai.expect(core.Test.get().then((instance) => instance.remove()).then(() => core.Test.get())).to.eventually.be.null;
        });

        it("should set the instance's isNew property to true",() => {
            return chai.expect(core.Test.get().then((instance) => instance.remove())).to.eventually.have.property("_isNew", true);
        });

        it("should return a promise for the instance",() => {
            return core.Test.get().then((instance) => chai.expect(instance.remove()).to.eventually.equal(instance));
        });

        it("shouldn't mind if the object has already been removed",() => {
            return core.Test.get().then(instance => {
                return chai.expect(core.Test.remove().then(() => instance.remove())).to.eventually.not.be.rejected;
            });
        });

        it("should be a no-op if the object is marked as _isNew",() => {
            return core.Test.get().then(instance => {
                let newInstance = new core.Test.Instance(instance.document);
                return newInstance.remove();
            }).then(() => chai.expect(core.Test.count()).to.eventually.equal(1));
        });

        it("should allow the use of a callback instead of promises",(done) => {
            core.Test.get().then((instance) => {
                instance.remove((err, result) => {
                    if (err) return done(err);
                    chai.expect(result).to.equal(instance);
                    return done();
                });
            });
        });
    });

    describe("delete()",() => {
        beforeEach(() => core.Test.remove().then(() => core.Test.insert({ answer: 1 })));

        it("should remove the document from the database",() => {
            return chai.expect(core.Test.get().then((instance) => instance.delete()).then(() => core.Test.get())).to.eventually.be.null;
        });

        it("should set the instance's isNew property to true",() => {
            return chai.expect(core.Test.get().then((instance) => instance.delete())).to.eventually.have.property("_isNew", true);
        });

        it("should return a promise for the instance",() => {
            return core.Test.get().then((instance) => chai.expect(instance.delete()).to.eventually.equal(instance));
        });

        it("shouldn't mind if the object has already been removed",() => {
            return core.Test.get().then(instance => {
                return chai.expect(core.Test.remove().then(() => instance.delete())).to.eventually.not.be.rejected;
            });
        });

        it("should be a no-op if the object is marked as _isNew",() => {
            return core.Test.get().then(instance => {
                let newInstance = new core.Test.Instance(instance.document);
                return newInstance.delete();
            }).then(() => chai.expect(core.Test.count()).to.eventually.equal(1));
        });

        it("should allow the use of a callback instead of promises",(done) => {
            core.Test.get().then((instance) => {
                instance.delete((err, result) => {
                    if (err) return done(err);
                    chai.expect(result).to.equal(instance);
                    return done();
                });
            });
        });
    });

    describe("first()",() => {
        beforeEach(() => core.Test.remove().then(() => core.Test.insert({ answer: 1, lots: [1, 2, 3, 4], less: { "a": 1, "b": 2 } })));

        it("should return the first object which matches the predicate over an array",() => {
            return chai.expect(core.Test.get().then(instance => instance.first(instance.lots, lot => lot == 2))).to.eventually.equal(2);
        });

        it("should return the first object which matches the predicate over an object",() => {
            return chai.expect(core.Test.get().then(instance => instance.first(instance.less, (value, key) => key == "a"))).to.eventually.equal(1);
        });

        it("should return null if no item was found",() => {
            return chai.expect(core.Test.get().then(instance => instance.first(instance.lots, lot => lot > 100))).to.eventually.be.null;
        });
    });

    describe("select()",() => {
        beforeEach(() => core.Test.remove().then(() => core.Test.insert({ answer: 1, lots: [1, 2, 3, 4], less: { "a": 1, "b": 2 } })));

        it("should return the objects which match the predicate over an array",() => {
            return chai.expect(core.Test.get().then(instance => instance.select(instance.lots, lot => lot > 2))).to.eventually.eql([3, 4]);
        });

        it("should return the properties which match the predicate over an object",() => {
            return chai.expect(core.Test.get().then(instance => instance.select(instance.less,(value, key) => key == "a"))).to.eventually.eql({ "a": 1 });
        });

        it("should return an empty array if no items matched over an array",() => {
            return chai.expect(core.Test.get().then(instance => instance.select(instance.lots, lot => lot > 100))).to.eventually.be.eql([]);
        });

        it("should return an empty object if no items matched over an object",() => {
            return chai.expect(core.Test.get().then(instance => instance.select(instance.less, lot => lot > 100))).to.eventually.be.eql({});
        });
    });

    describe("modifications", () => {
        beforeEach(() => core.Test.remove().then(() => core.Test.insert({ answer: 1, lots: [1, 2, 3, 4], less: { "a": 1, "b": 2 } })));

        it("should correctly diff simple property changes", () => {
            return core.Test.get().then(instance => {
                instance.answer = 2;
                return instance.save();
            }).then(instance => {
                chai.expect(instance).to.have.property("answer", 2);
            });
        });

        it("should correctly diff deep property changes", () => {
            return core.Test.get().then(instance => {
                instance.less["a"] = 2;
                return instance.save();
            }).then(instance => {
                chai.expect(instance).to.have.property("less").eql({ a: 2, b: 2 });
            });
        });

        it("should correctly diff array operations", () => {
            return core.Test.get().then(instance => {
                instance.lots.push(5);
                return instance.save();
            }).then(instance => {
                chai.expect(instance).to.have.property("lots").eql([1,2,3,4,5]);
            });
        });
    });

    describe("after a save", () => {
        var instance: Test;

        before(() => core.Test.remove().then(() => core.Test.insert({ answer: 1, lots: [1, 2, 3, 4], less: { "a": 1, "b": 2 } })).then(i => {
            i.answer = 3;
            return i.save();
        }).then(i => instance = i));

        it("should return the instance", () => {
            chai.expect(instance).to.exist;
        });

        it("should correctly diff simple property changes", () => {
            return Promise.resolve(instance).then(i => {
                i.answer = 2;
                return i.save();
            }).then(i => {
                chai.expect(i).to.exist;
                chai.expect(i).to.have.property("answer", 2);
            });
        });

        it("should correctly diff deep property changes", () => {
            return Promise.resolve(instance).then(i => {
                i.less["a"] = 2;
                return i.save();
            }).then(i => {
                chai.expect(i).to.exist;
                chai.expect(i).to.have.property("less").eql({ a: 2, b: 2 });
            });
        });

        it("should correctly diff array operations", () => {
            return Promise.resolve(instance).then(i => {
                i.lots.push(5);
                return i.save();
            }).then(i => {
                chai.expect(i).to.exist;
                chai.expect(i).to.have.property("lots").eql([1,2,3,4,5]);
            });
        });

   });
});