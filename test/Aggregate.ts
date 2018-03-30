import * as Iridium from "../iridium";
import * as MongoDB from "mongodb";
import {Cursor} from "../lib/Cursor";
import * as _ from "lodash";
import * as chai from "chai";

interface TestDocument {
    _id?: string;
    group: string;
    score: number;
}

class Test extends Iridium.Instance<TestDocument, Test> implements TestDocument {
    static collection = "test";
    static schema: Iridium.Schema = {
        _id: MongoDB.ObjectID,
        group: String,
        score: Number
    };

    _id: string;
    group: string;
    score: number;
}

describe("Model", () => {
    let core = new Iridium.Core({ database: "test" });

    before(() => core.connect());
    after(() => core.close());

    describe("aggregate()", () => {
       let model = new Iridium.Model<TestDocument, Test>(core, Test);

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
            return model.aggregate<{ _id: string; score: number; }>([
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