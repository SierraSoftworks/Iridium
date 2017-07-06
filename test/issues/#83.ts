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

    describe("#83", () => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);

        it("track.save should update track accordingly", () => {
            return model.remove().then(() => model.insert({
                stuff: {
                    bomber: {
                        123456: [
                            {time: new Date("2016-06-08T13:27:16.000Z"), type:"absolute"},
                            {time: new Date("2016-06-08T14:03:08.000Z"), type:"relative"},
                            {time: new Date("2016-06-08T12:06:22.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T12:10:00.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T12:11:40.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T12:14:14.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T12:16:12.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T12:18:06.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T12:20:12.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T12:22:32.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T12:46:44.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T12:48:44.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T12:51:10.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T12:53:06.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T12:55:36.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T12:57:34.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:00:10.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:03:14.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:05:44.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:07:50.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:10:18.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:12:28.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:14:46.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:16:58.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:18:54.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:21:24.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:23:18.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:25:42.000Z"), type:"counted"}
                        ]
                    }
                }
            })).then(test => {
                test.stuff = {
                    bomber: {
                        123456: [
                            {time: new Date("2016-06-08T13:27:16.000Z"), type:"absolute"},
                            {time: new Date("2016-06-08T12:57:34.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:03:14.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:05:44.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:07:50.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:10:18.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:12:28.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:14:46.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:16:58.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:18:54.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:21:24.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:23:18.000Z"), type:"counted"},
                            {time: new Date("2016-06-08T13:25:42.000Z"), type:"counted"}
                        ]
                    }
                }
                return test.save();
            }).then(test => {
                console.log(JSON.stringify(test));
                chai.expect(test).to.eql({
                    stuff: {
                        bomber: {
                            123456: [
                                {time: new Date("2016-06-08T13:27:16.000Z"), type:"absolute"},
                                {time: new Date("2016-06-08T12:57:34.000Z"), type:"counted"},
                                {time: new Date("2016-06-08T13:03:14.000Z"), type:"counted"},
                                {time: new Date("2016-06-08T13:05:44.000Z"), type:"counted"},
                                {time: new Date("2016-06-08T13:07:50.000Z"), type:"counted"},
                                {time: new Date("2016-06-08T13:10:18.000Z"), type:"counted"},
                                {time: new Date("2016-06-08T13:12:28.000Z"), type:"counted"},
                                {time: new Date("2016-06-08T13:14:46.000Z"), type:"counted"},
                                {time: new Date("2016-06-08T13:16:58.000Z"), type:"counted"},
                                {time: new Date("2016-06-08T13:18:54.000Z"), type:"counted"},
                                {time: new Date("2016-06-08T13:21:24.000Z"), type:"counted"},
                                {time: new Date("2016-06-08T13:23:18.000Z"), type:"counted"},
                                {time: new Date("2016-06-08T13:25:42.000Z"), type:"counted"}
                            ]
                        }
                    }
                });
            });
        });
    });
});