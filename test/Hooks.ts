import * as Iridium from "../iridium";
import {Delay} from "../lib/utils/Promise";
import * as Events from "events";
import * as chai from "chai";

interface TestDocument {
    id?: string;
    answer: number;
}

let hookEmitter = new Events.EventEmitter();

let shouldReject = 0;
class Test extends Iridium.Instance<TestDocument, Test> {
    static collection = "test";
    static schema: Iridium.Schema = {
        _id: false,
        answer: Number
    };

    id: string;
    answer: number;

    static onCreating(document: TestDocument): Promise<void>|undefined {
        if (shouldReject === 1) return Promise.reject("test rejection");
        hookEmitter.emit("creating", document);
    }

    static onReady(instance: Test): Promise<void>|undefined {
        if (shouldReject === 2) return Promise.reject("test rejection");
        hookEmitter.emit("ready", instance);
    }

    static onRetrieved(document: TestDocument): Promise<void>|undefined {
        if (shouldReject === 3) return Promise.reject("test rejection");
        hookEmitter.emit("retrieved", document);
    }

    static onSaving(instance: Test, changes: any): Promise<void>|undefined {
        if (shouldReject === 4) return Promise.reject("test rejection");
        hookEmitter.emit("saving", instance, changes);
    }
}

describe("Hooks", function() {
    this.timeout(500);

    let core = new Iridium.Core({ database: "test" });
    let model = new Iridium.Model<TestDocument, Test>(core, Test);

    beforeEach(() => { shouldReject = 0 });
    beforeEach(() => core.connect().then(() => model.remove()).then(() => model.insert({ answer: 10 })));
    afterEach(() => model.remove());
    after(() => core.close());

    describe("creating",() => {
        after(() => {
            // Not used again
            Test.onCreating = (doc) => Promise.resolve();
        });

        it("should be called when a document is being created from Model.insert", async () => {
            let onCreatingHit: boolean = false;
            hookEmitter.once("creating", () => onCreatingHit = true);

            await model.insert({ answer: 11 });

            chai.expect(onCreatingHit).to.be.true;
        });

        it("should be called when a document is being created from Model.create", async () => {
            let onCreatingHit: boolean = false;
            hookEmitter.once("creating", () => onCreatingHit = true);

            await model.create({ answer: 11 });

            chai.expect(onCreatingHit).to.be.true;
        });

        it("should be called when a document is being created from Instance.save", async () => {
            let onCreatingHit: boolean = false;
            hookEmitter.once("creating", () => onCreatingHit = true);

            const testInstance = new model.Instance({ answer: 11 });
            await testInstance.save();

            chai.expect(onCreatingHit).to.be.true;
        });

        it("should be passed the document being created",() => {
            let result: Promise<void>;

            hookEmitter.once("creating",(document: TestDocument) => {
                result = Promise.resolve().then(() => {
                    chai.expect(document).to.eql({ answer: 11 });
                });
            });

            return model.insert({ answer: 11 }).then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should support blocking async calls", () => {
            let result: boolean = false;
            Test.onCreating = (document: TestDocument) => {
                return Delay(50, true).then(() => { result = true });
            };

            return model.insert({ answer: 11 }).then(() => chai.expect(result).to.be.true);
        });
    });

    describe("ready",() => {
        after(() => {
            // Not used again
            Test.onReady = () => Promise.resolve();
        });

        it("should be called when an instance is prepared",() => {
            let result: Promise<void>;

            hookEmitter.once("ready",() => {
                result = Promise.resolve();
            });

            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should be passed the instance which was created",() => {
            let result: Promise<void>;

            hookEmitter.once("ready",(instance: Test) => {
                result = Promise.resolve().then(() => {
                    chai.expect(instance).to.be.an.instanceof(model.Instance);
                });
            });

            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should support blocking async calls", () => {
            let result: boolean = false;
            Test.onReady = (instance: Test) => {
                return Delay(50, true).then(() => { result = true });
            };

            return model.get().then(() => chai.expect(result).to.be.true);
        });
    });

    describe("retreived",() => {
        after(() => {
            // Not used again
            Test.onRetrieved = () => Promise.resolve();
        });

        it("should be called when a document is being retrieved",() => {
            let result: Promise<void>;

            hookEmitter.once("retrieved",() => {
                result = Promise.resolve();
            });

            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should be passed the document being retrieved",() => {
            let result: Promise<void>;

            hookEmitter.once("retrieved",(document: TestDocument) => {
                result = Promise.resolve().then(() => {
                    chai.expect(document).to.have.property("answer", 10);
                });
            });

            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should support blocking async calls", () => {
            let result: boolean = false;
            Test.onRetrieved = (document: TestDocument) => {
                return Delay(50, true).then(() => { result = true });
            };

            return model.get().then(() => chai.expect(result).to.be.true);
        });
    });

    describe("saving", () => {
        after(() => {
            // Not used again
            Test.onSaving = () => Promise.resolve();
        });

        it("should be triggered when save() is called on an instance",() => {
            let result: Promise<void>;

            hookEmitter.once("saving",() => {
                result = Promise.resolve();
            });

            return model.get().then((instance) => {
                instance.answer++;
                return instance.save();
            }).then(() => chai.expect(result).to.exist).then(() => result);
        });

        it("should be passed the instance being saved",() => {
            let result: Promise<void>;

            hookEmitter.once("saving",(instance: Test) => {
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

            hookEmitter.once("saving",(instance: Test, changes: Iridium.Changes) => {
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
                return Delay(50, true).then(() => { result = true });
            };

            return model.get().then((instance) => {
                instance.answer++;
                return instance.save();
            }).then(() => chai.expect(result).to.be.true);
        });
    });
});