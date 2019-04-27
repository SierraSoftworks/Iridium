"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Iridium = require("../iridium");
let Instance = class Instance extends Iridium.Instance {
};
__decorate([
    Iridium.ObjectID
], Instance.prototype, "_id", void 0);
__decorate([
    Iridium.Property({
        type: /^LineString$/,
        coordinates: [[Number, 2, 2]]
    })
], Instance.prototype, "path", void 0);
Instance = __decorate([
    Iridium.Collection("test")
], Instance);
class Core extends Iridium.Core {
    constructor() {
        super(...arguments);
        this.Model = new Iridium.Model(this, Instance);
    }
}
describe("Changes", () => {
    let core = new Core("mongodb://localhost/iridium_test");
    before(() => core.connect());
    after(() => core.close());
    describe("should allow you to specify valid operations", () => {
        it("should allow you to use the $push operator", () => {
            return core.Model.update({}, {
                $push: {
                    "path.coordinates": {
                        $each: [[1, 2]],
                        $position: 1,
                        $sort: { a: 1 }
                    }
                }
            });
        });
    });
});
//# sourceMappingURL=Changes.js.map