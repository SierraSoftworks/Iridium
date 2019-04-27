"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const Skmatc = require("skmatc");
const chai = require("chai");
class Test extends Iridium.Instance {
}
Test.collection = "test";
Test.schema = {
    _id: false
};
describe("Plugins", () => {
    let core;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        core = new Iridium.Core({ database: "test" });
        yield core.connect();
    }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        yield core.db.dropCollection("test");
        yield core.db.dropCollection("apartments");
    }));
    describe("newModel", () => {
        it("should allow a plugin not to define a handler", () => {
            core.register({
                newInstance: (instance, model) => { },
                validate: []
            });
        });
        it("should allow a plugin to define a handler", () => {
            core.register({
                newModel: (model) => { },
                newInstance: (instance, model) => { },
                validate: []
            });
        });
        it("should be called when a new model is created", () => {
            let wasCalled = false;
            core.register({
                newModel: (model) => {
                    wasCalled = true;
                }
            });
            let model = new Iridium.Model(core, Test);
            chai.expect(wasCalled).to.be.true;
        });
        it("should be able to make modifications to the model", () => {
            core.register({
                newModel: (model) => {
                    model.collectionName = "changed";
                }
            });
            let model = new Iridium.Model(core, Test);
            chai.expect(model.collectionName).to.exist.and.be.equal("changed");
        });
    });
    describe("newInstance", () => {
        it("should allow a plugin not to define a handler", () => {
            core.register({
                newModel: (model) => { },
                validate: []
            });
        });
        it("should allow a plugin to define a handler", () => {
            core.register({
                newModel: (model) => { },
                newInstance: (instance, model) => { },
                validate: []
            });
        });
        it("should be called when an instance is instantiated", () => {
            let wasCalled = false;
            core.register({
                newModel: (model) => { },
                newInstance: (instance, model) => {
                    wasCalled = true;
                },
                validate: []
            });
            let model = new Iridium.Model(core, Test);
            let instance = new model.Instance({});
            chai.expect(wasCalled).to.be.true;
        });
        it("should not be called when the instance doesn't inherit from Iridium.Instance", () => {
            let wasCalled = false;
            core.register({
                newModel: (model) => { },
                newInstance: (instance, model) => {
                    wasCalled = true;
                },
                validate: []
            });
            let instanceImplementation = function () { return {}; };
            instanceImplementation.collection = "test";
            instanceImplementation.schema = {
                _id: false
            };
            let model = new Iridium.Model(core, instanceImplementation);
            let instance = new model.Instance({});
            chai.expect(wasCalled).to.be.false;
        });
    });
    describe("validators", () => {
        it("should allow a plugin to not define validators", () => {
            core.register({
                newModel: (model) => { },
                newInstance: (instance, model) => { }
            });
        });
        it("should allow a plugin to define a single validator", () => {
            core.register({
                newInstance: (instance, model) => { },
                validate: Skmatc.create((schema) => schema == "Test", function (schema, data) { return this.assert(data == "test"); })
            });
        });
        it("should allow a plugin to define multiple validators", () => {
            core.register({
                newInstance: (instance, model) => { },
                validate: [Skmatc.create((schema) => schema == "Test", function (schema, data) { return this.assert(data == "test"); })]
            });
        });
        it("should actually use a plugin's validator array to validate a document", () => __awaiter(this, void 0, void 0, function* () {
            class Apartment extends Iridium.Instance {
            }
            Apartment.collection = "apartments";
            Apartment.schema = {
                _id: false
            };
            __decorate([
                Iridium.Property("Kittens")
            ], Apartment.prototype, "kittens", void 0);
            let wasCalled = false;
            core.register({
                validate: [Skmatc.create((schema) => schema == "Kittens", function (schema, data) {
                        wasCalled = true;
                        return this.assert(data.length >= 1, "Kittens are mandatory! Must have at least 1.");
                    })]
            });
            const apartmentModel = new Iridium.Model(core, Apartment);
            const apartment = new apartmentModel.Instance({ kittens: ['Sweety'] });
            yield apartment.save();
            chai.expect(wasCalled).to.be.true;
        }));
        it("should actually use a plugin's single validator object to validate a document", () => __awaiter(this, void 0, void 0, function* () {
            class Apartment extends Iridium.Instance {
            }
            Apartment.collection = "apartments";
            Apartment.schema = {
                _id: false
            };
            __decorate([
                Iridium.Property("Cats")
            ], Apartment.prototype, "kittens", void 0);
            let wasCalled = false;
            core.register({
                validate: Skmatc.create((schema) => schema == "Cats", function (schema, data) {
                    wasCalled = true;
                    return this.assert(data.length >= 1, "Cats are mandatory! Must have at least 1.");
                })
            });
            const apartmentModel = new Iridium.Model(core, Apartment);
            const apartment = new apartmentModel.Instance({ kittens: ['Sweety'] });
            yield apartment.save();
            chai.expect(wasCalled).to.be.true;
        }));
    });
});
//# sourceMappingURL=Plugins.js.map