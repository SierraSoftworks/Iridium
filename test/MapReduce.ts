import * as Iridium from "../iridium";
import * as MongoDB from "mongodb";
import { Cursor } from "../lib/Cursor";
import * as Promise from "bluebird";
import * as _ from "lodash";
import * as chai from "chai";

interface TestDocument {
    _id?: string;
    cust_id: string;
    amount: number;
    status: string;
}

class Test extends Iridium.Instance<TestDocument, Test> implements TestDocument {
    static collection = "test";
    static schema: Iridium.Schema = {
        _id: MongoDB.ObjectID,
        cust_id: String,
        amount: Number,
        status: String,
    };

    _id: string;
    cust_id: string;
    amount: number;
    status: string;
}

class MapReducedInstance extends Iridium.Instance<Iridium.MapReducedDocument<string, number>, MapReducedInstance>{
    static collection = "mapReduced";
    static mapReduceOptions = {
        map: function (this: TestDocument) {
            emit(this.cust_id, this.amount);
        },
        reduce: function (key: string, values: number[]) {
            var sum = 0;
            values.forEach(function (val, i, arr) { sum += val });
            return sum;
        }
    }
    _id: string
    value: number
}

describe("Model", () => {
    let core = new Iridium.Core({ database: "test" });

    before(() => core.connect());

    describe("mapReduce()", () => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);

        beforeEach(() => {
            return core.connect().then(() => model.remove()).then(() => model.insert([
                { cust_id: "A123", amount: 500, status: "A" },
                { cust_id: "A123", amount: 250, status: "A" },
                { cust_id: "A123", amount: 300, status: "B" },
                { cust_id: "B212", amount: 200, status: "A" }
            ]));
        });

        it("should correctly map and reduce with model", () => {
            let t = model.mapReduce(MapReducedInstance, { 
                out: { 
                    replace: "mapReduced" 
                }, query: { status: "A" } }).then(() => {
                let reducedModel = new Iridium.Model<Iridium.MapReducedDocument<string, number>, MapReducedInstance>(core, MapReducedInstance);
                return reducedModel.find().toArray()
            })
            return chai.expect(t).to.eventually.exist.and.have.length(2);
        });

        it("should correctly map and reduce inline", () => {
            let t = model.mapReduce({
                map: function (this: TestDocument) {
                    emit(this.cust_id, this.amount);
                }, reduce: function (k: string, v: number[]) {
                    var sum = 0;
                    v.forEach((val, i, arr) => { sum += val });
                    return sum;
                }
            }, { out: { inline: 1 }, query: { status: "A" } })
            return chai.expect(t).to.eventually.exist.and.have.length(2);
        });

        /*
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
                */
    });
});