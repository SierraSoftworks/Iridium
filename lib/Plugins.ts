import {Core} from "./Core";
import {Model} from "./Model";
import * as Skmatc from "skmatc";

// TODO: Add documentation
export interface Plugin {
    // TODO: Add documentation
    newModel? (model: Model<any, any>): void;

    // TODO: Add documentation
    newInstance? (instance: any, model: Model<any, any>): void;
    
    // TODO: Add documentation
    validate?: Skmatc.Validator | Skmatc.Validator[];
}