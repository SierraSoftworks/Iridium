"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Iridium = require("../../iridium");
const Omnom_1 = require("../../lib/utils/Omnom");
const chai = require("chai");
let Test = class Test extends Iridium.Instance {
};
__decorate([
    Iridium.ObjectID
], Test.prototype, "_id", void 0);
__decorate([
    Iridium.Property([{ x: Date, i: Number }])
], Test.prototype, "stuff", void 0);
Test = __decorate([
    Iridium.Collection("test")
], Test);
describe("issues", () => {
    let core = new Iridium.Core({ database: "test" });
    before(() => core.connect());
    after(() => core.close());
    function build_dataset(start, count) {
        return new Array(count).fill(undefined).map((val, idx) => {
            return {
                i: idx,
                x: new Date((start + idx) * 1000)
            };
        });
    }
    describe("#83", () => {
        let model = new Iridium.Model(core, Test);
        it("track.save should update track accordingly", () => {
            return model.remove().then(() => model.insert({
                stuff: build_dataset(1, 19)
            })).then(test => {
                test.stuff = build_dataset(20, 14);
                return test.save();
            }).then(test => {
                chai.expect(test.stuff).to.eql(build_dataset(20, 14));
            });
        });
        it("should derive the correct change definition", () => {
            const diff = Omnom_1.Omnom.diff({
                stuff: build_dataset(1, 19)
            }, {
                stuff: build_dataset(20, 14)
            });
            chai.expect(diff).to.eql({
                "$set": {
                    stuff: build_dataset(20, 14)
                }
            });
        });
    });
});
//# sourceMappingURL=#83.js.map