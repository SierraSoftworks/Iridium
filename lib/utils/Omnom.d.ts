/// <reference path="../../_references.d.ts" />
import MongoDB = require('mongodb');
export = Omnom;
declare class Omnom {
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
    static diff(original: number, modified: number): any;
    static diff(original: [any], modified: any[]): any;
    static diff(original: MongoDB.ObjectID, modified: MongoDB.ObjectID): any;
    static diff(original: Object, modified: Object): any;
    private onObject(original, modified, changePath?);
    private onObject(original, modified, changePath?);
    private onObject(original, modified, changePath?);
    private onObject(original, modified, changePath?);
    private onArray(original, modified, changePath);
    private set(path, value);
    private unset(path);
    private inc(path, value);
    private push(path, value);
    private pull(path, value);
    private pullAll(path, values);
    private resolve(...args);
    private almostEqual(o1, o2);
}
