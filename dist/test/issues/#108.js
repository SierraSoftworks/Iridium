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
let House = class House extends Iridium.Instance {
};
__decorate([
    Iridium.ObjectID
], House.prototype, "_id", void 0);
__decorate([
    Iridium.Property(String),
    Iridium.Rename("house_name")
], House.prototype, "houseName", void 0);
House = __decorate([
    Iridium.Collection("houses")
], House);
class Database extends Iridium.Core {
    constructor() {
        super(...arguments);
        this.Houses = new Iridium.Model(this, House);
    }
}
describe("issues", () => {
    let core = new Database({ database: "test" });
    before(() => core.connect());
    beforeEach(() => core.Houses.remove());
    after(() => core.close());
    describe("#108", () => {
        it("should correctly populate the renames", () => {
            chai.expect(House.renames).to.eql({
                houseName: "house_name"
            });
        });
        it("should correctly expose the correct house name on an instance", () => {
            const house = new core.Houses.Instance({
                houseName: "My House"
            });
            chai.expect(house.document).to.eql({
                houseName: "My House"
            });
            chai.expect(house.houseName).to.eql("My House");
            house.houseName = "My Other House";
            chai.expect(house.document).to.eql({
                houseName: "My Other House"
            });
        });
        it("should correctly save the field in the DB", () => {
            const house = new core.Houses.Instance({
                houseName: "My House"
            });
            return house.save().then(() => {
                return core.Houses.collection.findOne({}).then(doc => {
                    chai.expect(doc).to.have.property("house_name", "My House");
                });
            });
        });
        it("should correctly insert the document", () => {
            return core.Houses.insert({
                houseName: "My House"
            }).then(house => {
                chai.expect(house.houseName).to.eql("My House");
                return core.Houses.collection.findOne({}).then(doc => {
                    chai.expect(doc).to.have.property("house_name", "My House");
                });
            });
        });
        it("should correctly retrieve the document", () => {
            return core.Houses.insert({
                houseName: "My House"
            }).then(house => {
                chai.expect(house.houseName).to.eql("My House");
                return core.Houses.findOne().then(doc => {
                    chai.expect(doc).to.have.property("houseName", "My House");
                });
            });
        });
    });
});
//# sourceMappingURL=#108.js.map