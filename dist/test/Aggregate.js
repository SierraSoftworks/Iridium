"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Iridium = require("../iridium");
const MongoDB = require("mongodb");
const chai = require("chai");
class Test extends Iridium.Instance {
}
Test.collection = "test";
Test.schema = {
    _id: MongoDB.ObjectID,
    group: String,
    score: Number
};
describe("Model", () => {
    let core = new Iridium.Core({ database: "test" });
    before(() => core.connect());
    after(() => core.close());
    describe("aggregate()", () => {
        let model = new Iridium.Model(core, Test);
        beforeEach(() => {
            return core.connect().then(() => model.remove()).then(() => model.insert([
                { group: "A", score: 10 },
                { group: "B", score: 11 },
                { group: "C", score: 12 },
                { group: "A", score: 13 },
                { group: "B", score: 14 }
            ]));
        });
        it("should correctly pass through the aggregation pipeline", () => {
            return chai.expect(model.aggregate([
                { $group: { _id: "$group", score: { $sum: "$score" } } }
            ])).to.eventually.exist.and.have.length(3);
        });
        it("should allow you to specify the type of the resulting documents", () => {
            return model.aggregate([
                { $match: { group: "A" } },
                { $group: { _id: "$group", score: { $sum: "$score" } } }
            ]).then(results => {
                chai.expect(results).to.exist.and.have.length(1);
                chai.expect(results[0]._id).to.eql("A");
                chai.expect(results[0].score).to.eql(23);
            });
        });
    });
});
//# sourceMappingURL=Aggregate.js.map