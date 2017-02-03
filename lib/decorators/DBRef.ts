import * as MongoDB from "mongodb";
import * as _ from "lodash";
import * as Skmatc from "skmatc";
import {Instance} from "../Instance";
import {Model} from "../Model";
import {InstanceImplementation} from "../InstanceInterface";
import {Transforms, DefaultTransforms} from "../Transforms";

export function DBRef() {

}

interface DBRefDoc {
    $ref: string;
    $id: any;
    $db?: string;
}

export class DBRef<TRef extends Instance<any, any>> {
    constructor(private model: Model<any, any>, private ref: DBRefDoc) {

    }

    resolve(): Promise<TRef> {
        return null
    }
}