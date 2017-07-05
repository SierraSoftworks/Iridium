import * as Iridium from "../../iridium";
import * as chai from "chai";

interface EventType
{
    type: string;
    time: Date;
};

interface TestDocument {
    _id?: string;

    stuff?: {
        [name: string]: {
            [tracker: number]: EventType[];
        }
    };
}


@Iridium.Collection("test")
class Test extends Iridium.Instance<TestDocument, Test> implements TestDocument {
    @Iridium.ObjectID
    _id: string;

    @Iridium.Property({
        $propertyType: {
            $propertyType: [{
                type: String,
                time: Date,
                position: {
                    $type: {
                        type: /^Point$/,
                        coordinates: [Number, 2, 2]
                    },
                    $required: false
                },
                data: {
                    $type: Object,
                    $required: false
                }
            }]
        }
    })
    stuff: {
        [name: string]: {
            [event: number]: EventType[];
        }
    };
}

describe("issues", () => {
    let core = new Iridium.Core({ database: "test" });
    before(() => core.connect());
    after(() => core.close());

    describe("#82", () => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);

        it("save should not throw $pull is empty", () => {
            return model.remove().then(() => model.insert({
                stuff: {
                    bomber: {
                        123456: [
                            { time: new Date("2016-06-08T13:27:18.000Z"), type: "absolute" },
                            { time: new Date("2016-06-08T14:03:12.000Z"), type: "relative" },
                            { time: new Date("2016-06-08T12:06:14.000Z"), type: "counted" },
                            { time: new Date("2016-06-08T12:10:14.000Z"), type: "counted" },
                            { time: new Date("2016-06-08T12:11:30.000Z"), type: "counted" },
                            { time: new Date("2016-06-08T12:14:32.000Z"), type: "counted" },
                            { time: new Date("2016-06-08T12:16:00.000Z"), type: "counted" },
                            { time: new Date("2016-06-08T12:18:18.000Z"), type: "counted" }
                        ]
                    }
                }
            })).then(test => {
                test.stuff = {
                    bomber: {
                        123456: [
                            { time: new Date("2016-06-08T13:27:18.000Z"), type: "absolute"},
                            { time: new Date("2016-06-08T13:03:24.000Z"), type: "counted"},
                            { time: new Date("2016-06-08T13:07:58.000Z"), type: "counted"},
                            { time: new Date("2016-06-08T13:10:02.000Z"), type: "counted"},
                            { time: new Date("2016-06-08T13:12:32.000Z"), type: "counted"}
                        ]
                    }
                }
                return test.save();
            });
        });
    });
});