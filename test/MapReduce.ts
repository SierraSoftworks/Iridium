import * as Iridium from "../iridium";
import * as MongoDB from "mongodb";
import { Cursor } from "../lib/Cursor";
import * as _ from "lodash";
import * as chai from "chai";

// This test folows the example depicted on https://docs.mongodb.com/manual/core/map-reduce/

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
            return values.reduce((sum, val) => sum + val, 0);
        }
    }

    _id: string;
    value: number;
}

@Iridium.MapReduce(function (this: TestDocument) {
    emit(this.cust_id, this.amount);
}, function (key: string, values: number[]) {
    return values.reduce((sum, val) => sum + val, 0);
})
class DecoratedMapReducedInstance extends Iridium.Instance<Iridium.MapReducedDocument<string, number>, MapReducedInstance>{
    static collection = "decoratedMapReduced";
    _id: string;
    value: number;
}

class NotMapReducedInstance extends Iridium.Instance<Iridium.MapReducedDocument<string, number>, MapReducedInstance>{
    static collection = "notMapReduced";
    _id: string;
    value: number;
}

describe("Model", () => {
    let core = new Iridium.Core({ database: "test" });

    before(() => core.connect());
    after(() => core.close());

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
        afterEach(() => core.close());

        it("should correctly map and reduce with model and decorator", () => {
            let reducedModel = new Iridium.Model<Iridium.MapReducedDocument<string, number>, DecoratedMapReducedInstance>(core, DecoratedMapReducedInstance);
            let t = reducedModel.remove().then(() => model.mapReduce(DecoratedMapReducedInstance, {
                out: "replace", query: { status: "A" }
            }).then(() => reducedModel.find().toArray()));
            return chai.expect(t).to.eventually.exist.and.have.length(2);
        });

        it("should correctly map and reduce with model", () => {
            let reducedModel = new Iridium.Model<Iridium.MapReducedDocument<string, number>, MapReducedInstance>(core, MapReducedInstance);
            let t = reducedModel.remove().then(() => model.mapReduce(MapReducedInstance, {
                out: "replace", query: { status: "A" }
            }).then(() => reducedModel.find().toArray()));
            return chai.expect(t).to.eventually.exist.and.have.length(2);
        });

        it("should correctly map and reduce inline without specifying out option", () => {
            let t = model.mapReduce({
                map: function (this: TestDocument) {
                    emit(this.cust_id, this.amount);
                }, reduce: function (k: string, v: number[]) {
                    return v.reduce((sum, val) => sum + val, 0);
                }
            }, { query: { status: "A" } });
            return chai.expect(t).to.eventually.exist.and.have.length(2);
        });

        it("should reject with wrong out option for inline", () => {
            let t = model.mapReduce({
                map: function (this: TestDocument) {
                    emit(this.cust_id, this.amount);
                }, reduce: function (k: string, v: number[]) {
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