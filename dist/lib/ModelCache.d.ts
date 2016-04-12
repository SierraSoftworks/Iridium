import { Model } from "./Model";
import * as Bluebird from "bluebird";
/**
 * A centralized class which ties the cache and cache directors together in a cohesive way
 * for use by Iridium.
 * @internal
 */
export declare class ModelCache {
    model: Model<any, any>;
    constructor(model: Model<any, any>);
    set<T>(value: T): void;
    get<T>(conditions: any): Bluebird<T>;
    clear(conditions: any): void;
}
