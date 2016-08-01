import * as Iridium from "../iridium";
import * as chai from "chai";

interface Document {
    _id?: string;
    path: {
        type: "LineString";
        coordinates: number[][];
    };
}

@Iridium.Collection("test")
class Instance extends Iridium.Instance<Document, Instance> {
    @Iridium.ObjectID
    _id: string;

    @Iridium.Property({
        type: /^LineString$/,
        coordinates: [[Number, 2, 2]]
    })
    path: {
        type: "LineString";
        coordinates: number[][];
    };
}

class Core extends Iridium.Core {
    Model = new Iridium.Model<Document, Instance>(this, Instance);
}

describe("Changes", () => {
    let core = new Core("mongodb://localhost/iridium_test");

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