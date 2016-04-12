import * as MongoDB from "mongodb";
export declare class Omnom {
    options: {
        atomicNumbers?: boolean;
    };
    constructor(options?: {
        atomicNumbers?: boolean;
    });
    private _changes;
    changes: {
        $set?: any;
        $unset?: any;
        $inc?: any;
        $push?: any;
        $pull?: any;
        $pullAll?: any;
    };
    diff(original: number, modified: number): Omnom;
    diff(original: [any], modified: any[]): Omnom;
    diff(original: MongoDB.ObjectID, modified: MongoDB.ObjectID): Omnom;
    diff(original: Object, modified: Object): Omnom;
    static diff(original: number, modified: number, options?: {
        atomicNumbers?: boolean;
    }): any;
    static diff(original: [any], modified: any[], options?: {
        atomicNumbers?: boolean;
    }): any;
    static diff(original: MongoDB.ObjectID, modified: MongoDB.ObjectID, options?: {
        atomicNumbers?: boolean;
    }): any;
    static diff(original: Object, modified: Object, options?: {
        atomicNumbers?: boolean;
    }): any;
    private onObject(original, modified, changePath?);
    private onObject(original, modified, changePath?);
    private onObject(original, modified, changePath?);
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
