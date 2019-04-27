"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Iridium = require("../iridium");
const MongoDB = require("mongodb");
const chai = require("chai");
class Test extends Iridium.Instance {
}
Test.collection = "test";
Test.schema = {
    _id: MongoDB.ObjectID,
    cust_id: String,
    amount: Number,
    status: String,
};
class MapReducedInstance extends Iridium.Instance {
}
MapReducedInstance.collection = "mapReduced";
MapReducedInstance.mapReduceOptions = {
    map: function () {
        emit(this.cust_id, this.amount);
    },
    reduce: function (key, values) {
        return values.reduce((sum, val) => sum + val, 0);
    }
};
let DecoratedMapReducedInstance = class DecoratedMapReducedInstance extends Iridium.Instance {
};
DecoratedMapReducedInstance.collection = "decoratedMapReduced";
DecoratedMapReducedInstance = __decorate([
    Iridium.MapReduce(function () {
        emit(this.cust_id, this.amount);
    }, function (key, values) {
        return values.reduce((sum, val) => sum + val, 0);
    })
], DecoratedMapReducedInstance);
class NotMapReducedInstance extends Iridium.Instance {
}
NotMapReducedInstance.collection = "notMapReduced";
describe("Model", () => {
    let core = new Iridium.Core({ database: "test" });
    before(() => core.connect());
    after(() => core.close());
    describe("mapReduce()", () => {
        let model = new Iridium.Model(core, Test);
        beforeEach(() => {
            return core.connect().then(() => model.remove()).then(() => model.insert([
                { cust_id: "A123", amount: 500, status: "A" },
                { cust_id: "A123", amount: 250, status: "A" },
                { cust_id: "A123", amount: 300, status: "B" },
                { cust_id: "B212", amount: 200, status: "A" }
            ]));
        });
        afterEach(() => core.close());
        it("should correctly map and reduce with model and decorator", () => {
            let reducedModel = new Iridium.Model(core, DecoratedMapReducedInstance);
            let t = reducedModel.remove().then(() => model.mapReduce(DecoratedMapReducedInstance, {
                out: "replace", query: { status: "A" }
            }).then(() => reducedModel.find().toArray()));
            return chai.expect(t).to.eventually.exist.and.have.length(2);
        });
        it("should correctly map and reduce with model", () => {
            let reducedModel = new Iridium.Model(core, MapReducedInstance);
            let t = reducedModel.remove().then(() => model.mapReduce(MapReducedInstance, {
                out: "replace", query: { status: "A" }
            }).then(() => reducedModel.find().toArray()));
            return chai.expect(t).to.eventually.exist.and.have.length(2);
        });
        it("should correctly map and reduce inline without specifying out option", () => {
            let t = model.mapReduce({
                map: function () {
                    emit(this.cust_id, this.amount);
                }, reduce: function (k, v) {
                    return v.reduce((sum, val) => sum + val, 0);
                }
            }, { query: { status: "A" } });
            return chai.expect(t).to.eventually.exist.and.have.length(2);
        });
        it("should reject with wrong out option for inline", () => {
            let t = model.mapReduce({
                map: function () {
                    emit(this.cust_id, this.amount);
                }, reduce: function (k, v) {
                    return v.reduce((sum, val) => sum + val, 0);
                }
            }, { out: "replace", query: { status: "A" } });
            return chai.expect(t).to.eventually.be.rejected;
        });
        it("should reject with wrong out option for model", () => {
            let t = model.mapReduce(MapReducedInstance, {
                out: "inline", query: { status: "A" }
            });
            return chai.expect(t).to.eventually.be.rejected;
        });
        it("should reject with no mapReduce info in Instance type", () => {
            let t = model.mapReduce(NotMapReducedInstance, {
                out: "replace", query: { status: "A" }
            });
            return chai.expect(t).to.eventually.be.rejected;
        });
    });
});
//# sourceMappingURL=MapReduce.js.map