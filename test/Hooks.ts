/// <reference path="../_references.d.ts" />
import Iridium = require('../index');
import Events = require('events');
import Promise = require('bluebird');

interface TestDocument {
    id?: string;
    answer: number;
}

class Test extends Iridium.Instance<TestDocument, Test> {
    id: string;
    answer: number;
}

var hookEmitter = new Events.EventEmitter();

describe("Hooks", function () {
    this.timeout(500);

    var core = new Iridium.Core({ database: 'test' });
    var model = new Iridium.Model<TestDocument, Test>(core, Test, 'test', {
        id: false,
        answer: Number
    }, {
            hooks: {
                creating: (document) => hookEmitter.emit('creating', document),
                ready: (instance) => hookEmitter.emit('ready', instance),
                retrieved: (document) => hookEmitter.emit('retrieved', document),
                saving: (instance, changes) => hookEmitter.emit('saving', instance, changes)
            }
        });

    beforeEach(() => core.connect().then(() => model.remove()).then(() => model.insert({ answer: 10 })));
    afterEach(() => model.remove());
    after(() => core.close());

    describe("creating",() => {
        it("should be called when a document is being created",(done) => {
            hookEmitter.once('creating',() => done());
            model.insert({ answer: 11 });
        });

        it("should be passed the document being created",() => {
            var result: Promise<void>;

            hookEmitter.once('creating',(document) => {
                result = Promise.resolve().then(() => {
                    chai.expect(document).to.eql({ answer: 11 });
                });
            });

            return model.insert({ answer: 11 }).then(() => chai.expect(result).to.exist).then(() => result);
        });
    });

    describe("ready",() => {
        it("should be called when an instance is prepared",() => {
            var result: Promise<void>;

            hookEmitter.once('ready',() => {
                result = Promise.resolve();
            });

            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should be passed the instance which was created",() => {
            var result: Promise<void>;

            hookEmitter.once('ready',(instance) => {
                result = Promise.resolve().then(() => {
                    chai.expect(instance).to.be.an.instanceof(model.Instance);
                });
            });

            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });
    });

    describe("retreived",() => {
        it("should be called when a document is being retrieved",() => {
            var result: Promise<void>;

            hookEmitter.once('retrieved',() => {
                result = Promise.resolve();
            });

            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should be passed the document being retrieved",() => {
            var result: Promise<void>;

            hookEmitter.once('retrieved',(document) => {
                result = Promise.resolve().then(() => {
                    chai.expect(document).to.have.property('answer', 10);
                });
            });

            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });
    });

    describe("saving",() => {
        it("should be triggered when save() is called on an instance",() => {
            var result: Promise<void>;

            hookEmitter.once('saving',() => {
                result = Promise.resolve();
            });

            return model.get().then((instance) => {
                instance.answer++;
                return instance.save();
            }).then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should be passed the instance being saved",() => {
            var result: Promise<void>;

            hookEmitter.once('saving',(instance) => {
                result = Promise.resolve().then(() => {
                    chai.expect(instance).to.be.an.instanceof(model.Instance);
                });
            });

            return model.get().then((instance) => {
                instance.answer++;
                return instance.save();
            }).then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should be passed the changes being made to the instance",() => {
            var result: Promise<void>;

            hookEmitter.once('saving',(instance, changes) => {
                result = Promise.resolve().then(() => {
                    chai.expect(changes).to.eql({
                        $set: { answer: instance.answer }
                    });
                });
            });

            return model.get().then((instance) => {
                instance.answer++;
                return instance.save();
            }).then(() => chai.expect(result).to.exist).then(() => result);
        });
    });
});