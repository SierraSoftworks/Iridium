"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Iridium = require("../iridium");
const Promise_1 = require("../lib/utils/Promise");
const Events = require("events");
const chai = require("chai");
let hookEmitter = new Events.EventEmitter();
let shouldReject = 0;
class Test extends Iridium.Instance {
    static onCreating(document) {
        if (shouldReject === 1)
            return Promise.reject("test rejection");
        hookEmitter.emit("creating", document);
    }
    static onReady(instance) {
        if (shouldReject === 2)
            return Promise.reject("test rejection");
        hookEmitter.emit("ready", instance);
    }
    static onRetrieved(document) {
        if (shouldReject === 3)
            return Promise.reject("test rejection");
        hookEmitter.emit("retrieved", document);
    }
    static onSaving(instance, changes) {
        if (shouldReject === 4)
            return Promise.reject("test rejection");
        hookEmitter.emit("saving", instance, changes);
    }
}
Test.collection = "test";
Test.schema = {
    _id: false,
    answer: Number
};
describe("Hooks", function () {
    this.timeout(500);
    let core = new Iridium.Core({ database: "test" });
    let model = new Iridium.Model(core, Test);
    beforeEach(() => { shouldReject = 0; });
    beforeEach(() => core.connect().then(() => model.remove()).then(() => model.insert({ answer: 10 })));
    afterEach(() => model.remove());
    after(() => core.close());
    describe("creating", () => {
        after(() => {
            // Not used again
            Test.onCreating = (doc) => Promise.resolve();
        });
        it("should be called when a document is being created from Model.insert", () => __awaiter(this, void 0, void 0, function* () {
            let onCreatingHit = false;
            hookEmitter.once("creating", () => onCreatingHit = true);
            yield model.insert({ answer: 11 });
            chai.expect(onCreatingHit).to.be.true;
        }));
        it("should be called when a document is being created from Model.create", () => __awaiter(this, void 0, void 0, function* () {
            let onCreatingHit = false;
            hookEmitter.once("creating", () => onCreatingHit = true);
            yield model.create({ answer: 11 });
            chai.expect(onCreatingHit).to.be.true;
        }));
        it("should be called when a document is being created from Instance.save", () => __awaiter(this, void 0, void 0, function* () {
            let onCreatingHit = false;
            hookEmitter.once("creating", () => onCreatingHit = true);
            const testInstance = new model.Instance({ answer: 11 });
            yield testInstance.save();
            chai.expect(onCreatingHit).to.be.true;
        }));
        it("should be passed the document being created", () => {
            let result;
            hookEmitter.once("creating", (document) => {
                result = Promise.resolve().then(() => {
                    chai.expect(document).to.eql({ answer: 11 });
                });
            });
            return model.insert({ answer: 11 }).then(() => chai.expect(result).to.exist).then(() => result);
        });
        it("should support blocking async calls", () => {
            let result = false;
            Test.onCreating = (document) => {
                return Promise_1.Delay(50, true).then(() => { result = true; });
            };
            return model.insert({ answer: 11 }).then(() => chai.expect(result).to.be.true);
        });
    });
    describe("ready", () => {
        after(() => {
            // Not used again
            Test.onReady = () => Promise.resolve();
        });
        it("should be called when an instance is prepared", () => {
            let result;
            hookEmitter.once("ready", () => {
                result = Promise.resolve();
            });
            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });
        it("should be passed the instance which was created", () => {
            let result;
            hookEmitter.once("ready", (instance) => {
                result = Promise.resolve().then(() => {
                    chai.expect(instance).to.be.an.instanceof(model.Instance);
                });
            });
            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });
        it("should support blocking async calls", () => {
            let result = false;
            Test.onReady = (instance) => {
                return Promise_1.Delay(50, true).then(() => { result = true; });
            };
            return model.get().then(() => chai.expect(result).to.be.true);
        });
    });
    describe("retreived", () => {
        after(() => {
            // Not used again
            Test.onRetrieved = () => Promise.resolve();
        });
        it("should be called when a document is being retrieved", () => {
            let result;
            hookEmitter.once("retrieved", () => {
                result = Promise.resolve();
            });
            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });
        it("should be passed the document being retrieved", () => {
            let result;
            hookEmitter.once("retrieved", (document) => {
                result = Promise.resolve().then(() => {
                    chai.expect(document).to.have.property("answer", 10);
                });
            });
            return model.get().then(() => chai.expect(result).to.exist).then(() => result);
        });
        it("should support blocking async calls", () => {
            let result = false;
            Test.onRetrieved = (document) => {
                return Promise_1.Delay(50, true).then(() => { result = true; });
            };
            return model.get().then(() => chai.expect(result).to.be.true);
        });
    });
    describe("saving", () => {
        after(() => {
            // Not used again
            Test.onSaving = () => Promise.resolve();
        });
        it("should be triggered when save() is called on an instance", () => {
            let result;
            hookEmitter.once("saving", () => {
                result = Promise.resolve();
            });
            return model.get().then((instance) => {
                instance.answer++;
                return instance.save();
            }).then(() => chai.expect(result).to.exist).then(() => result);
        });
        it("should be passed the instance being saved", () => {
            let result;
            hookEmitter.once("saving", (instance) => {
                result = Promise.resolve().then(() => {
                    chai.expect(instance).to.be.an.instanceof(model.Instance);
                });
            });
            return model.get().then((instance) => {
                instance.answer++;
                return instance.save();
            }).then(() => chai.expect(result).to.exist).then(() => result);
        });
        it("should be passed the changes being made to the instance", () => {
            let result;
            hookEmitter.once("saving", (instance, changes) => {
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
            let result = false;
            Test.onSaving = (instance, changes) => {
                return Promise_1.Delay(50, true).then(() => { result = true; });
            };
            return model.get().then((instance) => {
                instance.answer++;
                return instance.save();
            }).then(() => chai.expect(result).to.be.true);
        });
    });
});
//# sourceMappingURL=Hooks.js.map