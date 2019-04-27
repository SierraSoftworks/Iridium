import Iridium = require("../iridium");
import Skmatc = require("skmatc");
export interface TimestampsDoc {
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class TimestampsPlugin implements Iridium.Plugin {
    newModel(model: Iridium.Model<any, any>): void;
    validate: Skmatc.Validator[];
}
