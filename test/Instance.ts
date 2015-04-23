/// <reference path="../_references.d.ts" />
import Iridium = require('../index');

interface TestDocument {
    id?: string;
    answer: number;
}

class Test extends Iridium.Instance<TestDocument, Test> implements TestDocument {
    id: string;
    answer: number;

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

    Test = new Iridium.Model<TestDocument, Test>(this, Test, 'test', { id: false, answer: Number });
}

describe("Instance",() => {
    var core = new TestDB();

    before(() => core.connect());
    after(() => core.close());

    beforeEach(() => core.Test.remove());

    it("should expose the latest document values",() => {
        var instance = core.Test.helpers.wrapDocument({
            id: 'aaaaaa',
            answer: 2
        });

        chai.expect(instance).to.exist;
        chai.expect(instance.answer).to.be.equal(2);
        chai.expect(instance.id).to.be.equal('aaaaaa');
    });

    describe("methods",() => {
        it("should expose save()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).save).to.exist.and.be.a('function');
        });

        it("should expose update()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).update).to.exist.and.be.a('function');
        });

        it("should expose refresh()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).refresh).to.exist.and.be.a('function');
        });

        it("should expose delete()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).delete).to.exist.and.be.a('function');
        });

        it("should expose remove()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).remove).to.exist.and.be.a('function');
        });

        it("should override toJSON()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).toJSON()).to.eql({ id: '1', answer: 2 });
        });

        it("should override toString()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).toString()).to.eql(JSON.stringify({ id: '1', answer: 2 }, null, 2));
        });
    });

    describe("properties",() => {
        it("should expose document",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).document).to.eql({ id: '1', answer: 2 });
        });
    });

    it("should expose additional getters and setters",() => {
        var instance = core.Test.helpers.wrapDocument({
            id: 'aaaaaa',
            answer: 2
        });

        chai.expect(instance).to.exist;
        chai.expect(instance.ansqr).to.exist.and.be.equal(4);
    });

    it("should expose additional methods",() => {
        var instance = core.Test.helpers.wrapDocument({
            id: 'aaaaaa',
            answer: 2
        });

        chai.expect(instance).to.exist;
        chai.expect(instance.test).to.exist.and.be.a('function');
    });

    describe("save()",() => {

        beforeEach(() => core.Test.remove());

        it("should avoid making calls to the database if no changes were made to the instance",() => {
            var update = core.Test.collection.update;
            core.Test.collection.update = () => {
                chai.assert.fail();
            };

            return core.Test.insert({
                answer: 1
            }).then(() => chai.expect(core.Test.get().then((instance) => {
                return instance.save().then(() => {
                    core.Test.collection.update = update;
                });
            })));
        });

        it("should insert the instance if it is not present in the database",() => {
            var instance = new core.Test.Instance({
                answer: 1
            });

            chai.expect((<any>instance)._isNew).to.be.true;
            return chai.expect(instance.save().then(() => chai.expect(core.Test.get(instance.id)).to.eventually.have.property('answer', instance.answer))).to.eventually.be.ok;
        });

        it("should automatically generate the update query if one was not provided",() => {
            return core.Test.insert({
                answer: 1
            }).then(() => chai.expect(core.Test.get().then((instance) => {
                instance.answer = 42;
                return instance.save().then(() => core.Test.get(instance.id));
            })).to.eventually.have.property('answer', 42));
        });

        it("should allow you to specify a custom update query",() => {
            return core.Test.insert({
                answer: 1
            })
                .then(() => core.Test.get())
                .then((instance) => chai.expect(instance.save({ $set: { answer: 10 } })).to.eventually.have.property('answer', 10));
        });

        it("should allow you tp specify a custom update query and conditions for the update",() => {
            return core.Test.insert({
                answer: 1
            })
                .then(() => core.Test.get())
                .then((instance) => chai.expect(instance.save({ answer: { $lt: 5 } }, { $set: { answer: 10 } })).to.eventually.have.property('answer', 10));
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
            return core.Test.get().then((instance) => {
                core.Test.update({ id: instance.id }, {
                    $set: { answer: 10 }
                }).then(() => chai.expect(instance.update()).to.eventually.have.property('answer', 10));
            });
        });

        it("should return a promise for the instance",() => {
            return core.Test.get().then((instance) => {
                core.Test.update({ id: instance.id }, {
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
            return core.Test.get().then((instance) => {
                core.Test.update({ id: instance.id }, {
                    $set: { answer: 10 }
                }).then(() => chai.expect(instance.refresh()).to.eventually.have.property('answer', 10));
            });
        });

        it("should return a promise for the instance",() => {
            return core.Test.get().then((instance) => {
                core.Test.update({ id: instance.id }, {
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
            return chai.expect(core.Test.get().then((instance) => instance.remove())).to.eventually.have.property('_isNew', true);
        });

        it("should return a promise for the instance",() => {
            return core.Test.get().then((instance) => chai.expect(instance.remove()).to.eventually.equal(instance));
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
});