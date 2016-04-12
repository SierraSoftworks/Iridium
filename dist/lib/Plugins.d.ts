import { Model } from "./Model";
import Skmatc = require("skmatc");
export interface Plugin {
    newModel?(model: Model<any, any>): any;
    newInstance?(instance: any, model: Model<any, any>): any;
    validate?: Skmatc.Validator | Skmatc.Validator[];
}
