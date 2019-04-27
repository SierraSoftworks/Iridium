"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Iridium = require("../../iridium");
const chai = require("chai");
let BaseConfig = class BaseConfig extends Iridium.Instance {
};
__decorate([
    Iridium.ObjectID
], BaseConfig.prototype, "_id", void 0);
__decorate([
    Iridium.Property(String)
], BaseConfig.prototype, "option1", void 0);
BaseConfig = __decorate([
    Iridium.Collection('configs')
], BaseConfig);
class NumberConfig extends BaseConfig {
}
__decorate([
    Iridium.Property(Number)
], NumberConfig.prototype, "option2", void 0);
class StringConfig extends BaseConfig {
}
__decorate([
    Iridium.Property(String)
], StringConfig.prototype, "option2", void 0);
class Database extends Iridium.Core {
    constructor() {
        super(...arguments);
        this.NumberConfigs = new Iridium.Model(this, NumberConfig);
        this.StringConfigs = new Iridium.Model(this, StringConfig);
    }
}
describe("issues", () => {
    let core = new Database({ database: "test" });
    before(() => core.connect());
    after(() => core.close());
    describe("#91", () => {
        it("should allow inserting of a document with the number config", () => {
            return chai.expect(core.NumberConfigs.insert({
                option1: "test",
                option2: 1
            })).to.eventually.be.ok;
        });
        it("should allow inserting of a document with the string config", () => {
            return chai.expect(core.StringConfigs.insert({
                option1: "test",
                option2: "test"
            })).to.eventually.be.ok;
        });
    });
});
//# sourceMappingURL=#91.js.map