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
let Test = class Test extends Iridium.Instance {
};
__decorate([
    Iridium.ObjectID
], Test.prototype, "_id", void 0);
__decorate([
    Iridium.Property(true)
], Test.prototype, "metadata", void 0);
Test = __decorate([
    Iridium.Collection("test"),
    Iridium.Transform(doc => {
        if (doc.metadata && typeof doc.metadata === "string")
            doc.metadata = JSON.parse(doc.metadata);
        return doc;
    }, doc => {
        if (doc.metadata && typeof doc.metadata === "object")
            doc.metadata = JSON.stringify(doc.metadata);
        return doc;
    })
], Test);
describe("issues", () => {
    let core = new Iridium.Core({ database: "test" });
    before(() => core.connect());
    after(() => core.close());
    describe("#73", () => {
        let model = new Iridium.Model(core, Test);
        beforeEach(() => model.remove());
        beforeEach(() => model.insert([
            { metadata: { test: 1 } },
            { metadata: { test: 2 } },
            { metadata: { test: 3 } },
        ]));
        it("should persist metadata as a string", () => {
            return model.collection.find({}).toArray().then(docs => {
                return chai.expect(docs.map(c => c.metadata)).to.eql([
                    "{\"test\":1}",
                    "{\"test\":2}",
                    "{\"test\":3}"
                ]);
            });
        });
        it("map should apply document transforms", () => {
            return chai.expect(model.find().map(c => c.metadata)).to.eventually.eql([
                { test: 1 },
                { test: 2 },
                { test: 3 },
            ]);
        });
    });
});
//# sourceMappingURL=#73.js.map