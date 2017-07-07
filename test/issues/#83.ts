import * as Iridium from "../../iridium";
import {Omnom} from "../../lib/utils/Omnom";
import * as chai from "chai";

interface TestDocument {
    _id?: string;

    stuff?: { x: Date; i: number; }[];
}


@Iridium.Collection("test")
class Test extends Iridium.Instance<TestDocument, Test> implements TestDocument {
    @Iridium.ObjectID
    _id: string;

    @Iridium.Property([{ x: Date, i: Number }])
    stuff: { x: Date; i: number; }[];
}

describe("issues", () => {
    let core = new Iridium.Core({ database: "test" });
    before(() => core.connect());
    after(() => core.close());

    function build_dataset(start: number, count: number) {
        return new Array(count).fill(undefined).map((val, idx) => {
            return {
                i: idx,
                x: new Date((start+idx) * 1000)
            };
        });
    }

    describe("#83", () => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);

        it("track.save should update track accordingly", () => {
            return model.remove().then(() => model.insert({
                stuff: build_dataset(1, 19)
            })).then(test => {
                test.stuff = build_dataset(20, 14)
                return test.save();
            }).then(test => {
                chai.expect(test.stuff).to.eql(build_dataset(20, 14));
            });
        });

        it("should derive the correct change definition", () => {
            const diff = Omnom.diff({
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