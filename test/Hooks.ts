/// <reference path="../typings/DefinitelyTyped/tsd.d.ts" />
import * as Iridium from '../index';
import Events = require('events');
import Promise = require('bluebird');

interface TestDocument {
    id?: string;
    answer: number;
}

let hookEmitter = new Events.EventEmitter();

let shouldReject = 0;
class Test extends Iridium.Instance<TestDocument, Test> {
    static collection = 'test';
    static schema: Iridium.Schema = {
        _id: false,
        answer: Number
    };

    id: string;
    answer: number;

    static onCreating(document: TestDocument) {
        if (shouldReject === 1) return Promise.reject('test rejection');
        hookEmitter.emit('creating', document);
    }

    static onReady(instance: Test) {
        if (shouldReject === 2) return Promise.reject('test rejection');
        hookEmitter.emit('ready', instance);
    }

    static onRetrieved(document: TestDocument) {
        if (shouldReject === 3) return Promise.reject('test rejection');
        hookEmitter.emit('retrieved', document);
    }

    static onSaving(instance: Test, changes: any) {
        if (shouldReject === 4) return Promise.reject('test rejection');
        hookEmitter.emit('saving', instance, changes);
    }
}

describe("Hooks", function () {
    this.timeout(500);

    let core = new Iridium.Core({ database: 'test' });
    let model = new Iridium.Model<TestDocument, Test>(core, Test);

    beforeEach(() => shouldReject = 0);
    beforeEach(() => core.connect().then(() => model.remove()).then(() => model.insert({ answer: 10 })));
    afterEach(() => model.remove());
    after(() => core.close());

    describe("creating",() => {
        it("should be called when a document is being created",(done) => {
            hookEmitter.once('creating',() => done());
            model.insert({ answer: 11 });
        });

        it("should be passed the document being created",() => {
            let result: Promise<void>;

            hookEmitter.once('creating',(document) => {
                result = Promise.resolve().then(() => {
                    chai.expect(document).to.eql({ answer: 11 });
                });
            });

            return model.insert({ answer: 11 }).then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should accept promises",(done) => {
            shouldReject = 1;
            model.insert({ answer: 11 }).then(null, (err) => chai.expect(err).to.equal('test rejection') && done());
        });
    });

    describe("ready",() => {
        it("should be called when an instance is prepared",() => {
            let result: Promise<void>;

            hookEmitter.once('ready',() => {
                result = Promise.resolve();
            });

            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should be passed the instance which was created",() => {
            let result: Promise<void>;

            hookEmitter.once('ready',(instance) => {
                result = Promise.resolve().then(() => {
                    chai.expect(instance).to.be.an.instanceof(model.Instance);
                });
            });

            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should accept promises",(done) => {
            shouldReject = 2;
            model.get().then(null, (err) => chai.expect(err).to.equal('test rejection') && done());
        });
    });

    describe("retreived",() => {
        it("should be called when a document is being retrieved",() => {
            let result: Promise<void>;

            hookEmitter.once('retrieved',() => {
                result = Promise.resolve();
            });

            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should be passed the document being retrieved",() => {
            let result: Promise<void>;

            hookEmitter.once('retrieved',(document) => {
                result = Promise.resolve().then(() => {
                    chai.expect(document).to.have.property('answer', 10);
                });
            });

            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should accept promises",(done) => {
            shouldReject = 3;
            model.get().then(null, (err) => chai.expect(err).to.equal('test rejection') && done());
        });
    });

    describe("saving",() => {
        it("should be triggered when save() is called on an instance",() => {
            let result: Promise<void>;

            hookEmitter.once('saving',() => {
                result = Promise.resolve();
            });

            return model.get().then((instance) => {
                instance.answer++;
                return instance.save();
            }).then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should be passed the instance being saved",() => {
            let result: Promise<void>;

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
            let result: Promise<void>;

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

        it("should accept promises",(done) => {
            shouldReject = 4;
            model.get().then((instance) => {
                instance.answer++;
                return instance.save();
            }).then(null, (err) => chai.expect(err).to.equal('test rejection') && done());
        });
    });
});