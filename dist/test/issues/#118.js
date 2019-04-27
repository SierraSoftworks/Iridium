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
const CarSchema = {
    make: String,
    model: String
};
class Car {
    constructor(doc) {
        this.make = doc.make;
        this.model = doc.model;
    }
    toDB() {
        return {
            make: this.make,
            model: this.model
        };
    }
}
let House = class House extends Iridium.Instance {
};
__decorate([
    Iridium.ObjectID
], House.prototype, "_id", void 0);
__decorate([
    Iridium.Property(String)
], House.prototype, "houseName", void 0);
__decorate([
    Iridium.Property([CarSchema]),
    Iridium.TransformClassList(Car)
], House.prototype, "cars", void 0);
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
    describe("#118", () => {
        it("should correctly expose the properties", () => {
            const house = new core.Houses.Instance({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" },
                ]
            });
            chai.expect(house.document).to.eql({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" }
                ]
            });
            chai.expect(house.houseName).to.eql("My House");
            chai.expect(house.cars).to.have.length(1);
            chai.expect(house.cars[0]).to.be.instanceof(Car);
            chai.expect(house.cars[0].make).to.eql("Audi");
            chai.expect(house.cars[0].model).to.eql("A4");
        });
        it("should correctly propagate changes to basic properties", () => {
            const house = new core.Houses.Instance({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" },
                ]
            });
            chai.expect(house.document).to.eql({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" }
                ]
            });
            house.houseName = "My Other House";
            chai.expect(house.houseName).to.eql("My Other House");
            chai.expect(house.document).to.eql({
                houseName: "My Other House",
                cars: [
                    { make: "Audi", model: "A4" }
                ]
            });
        });
        it("should correctly propagate changes to complex properties when assigned", () => {
            const house = new core.Houses.Instance({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" },
                ]
            });
            chai.expect(house.document).to.eql({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" }
                ]
            });
            house.cars = [
                new Car({ make: "BMW", model: "325i" })
            ];
            chai.expect(house.document).to.eql({
                houseName: "My House",
                cars: [
                    { make: "BMW", model: "325i" }
                ]
            });
        });
        it("should correctly propagate changes to complex properties when they are modified", () => {
            const house = new core.Houses.Instance({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" },
                ]
            });
            chai.expect(house.document).to.eql({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" }
                ]
            });
            house.cars[0].model = "A6";
            chai.expect(house.cars[0].model).to.eql("A6");
            chai.expect(house.document).to.eql({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A6" }
                ]
            });
        });
        it("should write complex property changes during save", () => {
            const house = new core.Houses.Instance({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" },
                ]
            });
            house.cars[0].model = "A8";
            return house.save().then(house => {
                chai.expect(house.cars[0].model).to.eql("A8");
            })
                .then(() => core.Houses.get(house._id))
                .then(house => {
                chai.expect(house.cars[0].model).to.eql("A8");
            });
        });
    });
});
//# sourceMappingURL=#118.js.map