import * as MongoDB from "mongodb";
import { Changes } from "../Changes";
export declare class Omnom {
    options: {
        atomicNumbers?: boolean;
    };
    constructor(options?: {
        atomicNumbers?: boolean;
    });
    private _changes;
    readonly changes: Changes;
    diff(original: number, modified: number): Omnom;
    diff(original: [any], modified: any[]): Omnom;
    diff(original: MongoDB.ObjectID, modified: MongoDB.ObjectID): Omnom;
    diff(original: Object, modified: Object): Omnom;
    static diff(original: number, modified: number, options?: {
        atomicNumbers?: boolean;
    }): Changes;
    static diff(original: [any], modified: any[], options?: {
        atomicNumbers?: boolean;
    }): Changes;
    static diff(original: MongoDB.ObjectID, modified: MongoDB.ObjectID, options?: {
        atomicNumbers?: boolean;
    }): Changes;
    static diff(original: Object, modified: Object, options?: {
        atomicNumbers?: boolean;
    }): Changes;
    private onSomething(original, modified, changePath?);
    private onSomething(original, modified, changePath?);
    private onSomething(original, modified, changePath?);
    private onSomething(original, modified, changePath?);
    private onUndefined(original, modified, changePath);
    private onNumber(original, modified, changePath);
    private onObjectID(original, modified, changePath);
    private onScalar(original, modified, changePath);
    private onObject(original, modified, changePath?);
    private onArray(original, modified, changePath);
    private onSmallerArray(original, modified, changePath);
    private onLargerArray(original, modified, changePath);
    private onSimilarArray(original, modified, changePath);
    private set(path, value);
    private unset(path);
    private inc(path, value);
    private push(path, value);
    private pull(path, value);
    private pullAll(path, values);
    private resolve(...args);
    private almostEqual(o1, o2);
}
