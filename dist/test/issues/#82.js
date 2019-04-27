"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Iridium = require("../../iridium");
;
let Test = class Test extends Iridium.Instance {
};
__decorate([
    Iridium.ObjectID
], Test.prototype, "_id", void 0);
__decorate([
    Iridium.Property({
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
], Test.prototype, "stuff", void 0);
Test = __decorate([
    Iridium.Collection("test")
], Test);
describe("issues", () => {
    let core = new Iridium.Core({ database: "test" });
    before(() => core.connect());
    after(() => core.close());
    describe("#82", () => {
        let model = new Iridium.Model(core, Test);
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
                            { time: new Date("2016-06-08T13:27:18.000Z"), type: "absolute" },
                            { time: new Date("2016-06-08T13:03:24.000Z"), type: "counted" },
                            { time: new Date("2016-06-08T13:07:58.000Z"), type: "counted" },
                            { time: new Date("2016-06-08T13:10:02.000Z"), type: "counted" },
                            { time: new Date("2016-06-08T13:12:32.000Z"), type: "counted" }
                        ]
                    }
                };
                return test.save();
            });
        });
    });
});
//# sourceMappingURL=#82.js.map