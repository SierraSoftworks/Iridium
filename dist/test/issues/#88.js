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
let Run = class Run extends Iridium.Instance {
};
__decorate([
    Iridium.ObjectID
], Run.prototype, "_id", void 0);
__decorate([
    Iridium.Property(String)
], Run.prototype, "token", void 0);
Run = __decorate([
    Iridium.Collection('runs')
], Run);
class Database extends Iridium.Core {
    constructor() {
        super(...arguments);
        this.Runs = new Iridium.Model(this, Run);
    }
}
describe("issues", () => {
    let core = new Database({ database: "test" });
    before(() => core.connect());
    after(() => core.close());
    describe("#88", () => {
        it("should allow inserting of a document", () => {
            return chai.expect(core.Runs.insert({
                token: 'test'
            })).to.eventually.be.ok;
        });
    });
});
//# sourceMappingURL=#88.js.map