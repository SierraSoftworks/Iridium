/// <reference path="../typings/DefinitelyTyped/tsd.d.ts" />
import * as Iridium from '../index';
import Events = require('events');
import Promise = require('bluebird');

interface TestDocument {
    id?: string;
    answer: number;
}

let hookEmitter = new Events.EventEmitter();

class Test extends Iridium.Instance<TestDocument, Test> {
    static collection = 'test';
    static schema: Iridium.Schema = {
        _id: false,
        answer: Number
    };

    id: string;
    answer: number;

    static onCreating(document: TestDocument) {
        hookEmitter.emit('creating', document);
    }

    static onReady(instance: Test) {
        hookEmitter.emit('ready', instance);
    }

    static onRetrieved(document: TestDocument) {
        hookEmitter.emit('retrieved', document);
    }

    static onSaving(instance: Test, changes: any) {
        hookEmitter.emit('saving', instance, changes);
    }
}

describe("Hooks", function () {
    this.timeout(500);

    let core = new Iridium.Core({ database: 'test' });
    let model = new Iridium.Model<TestDocument, Test>(core, Test);

    beforeEach(() => core.connect().then(() => model.remove()).then(() => model.insert({ answer: 10 })));
    afterEach(() => model.remove());
    after(() => core.close());

    describe("creating",() => {
        after(() => {
            // Not used again
            Test.onCreating = null;
        });

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

        it("should support blocking async calls", () => {
            let result: boolean = false;
            Test.onCreating = (document: TestDocument) => {
                return Promise.delay(true, 50).then(() => result = true);
            };

            return model.insert({ answer: 11 }).then(() => chai.expect(result).to.be.true);
        });
    });

    describe("ready",() => {
        after(() => {
            // Not used again
            Test.onReady = null;
        });

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

        it("should support blocking async calls", () => {
            let result: boolean = false;
            Test.onReady = (instance: Test) => {
                return Promise.delay(true, 50).then(() => result = true);
            };

            return model.get().then(() => chai.expect(result).to.be.true);
        });
    });

    describe("retreived",() => {
        after(() => {
            // Not used again
            Test.onRetrieved = null;
        });

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

        it("should support blocking async calls", () => {
            let result: boolean = false;
            Test.onRetrieved = (document: TestDocument) => {
                return Promise.delay(true, 50).then(() => result = true);
            };

            return model.get().then(() => chai.expect(result).to.be.true);
        });
    });

    describe("saving", () => {
        after(() => {
            // Not used again
            Test.onSaving = null;
        });

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


        it("should support blocking async calls", () => {
            let result: boolean = false;
            Test.onSaving = (instance: Test, changes: any) => {
                return Promise.delay(true, 50).then(() => result = true);
            };

            return model.get().then((instance) => {
                instance.answer++;
                return instance.save();
            }).then(() => chai.expect(result).to.be.true);
        });
    });
});