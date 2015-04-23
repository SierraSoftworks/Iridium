/// <reference path="../../_references.d.ts" />
import cache = require('../Cache');
import Promise = require('bluebird');
export = NoOpCache;
declare class NoOpCache implements cache {
    set<T>(key: string, object: T): Promise<T>;
    get<T>(key: string): Promise<void>;
    clear(key: string): Promise<boolean>;
}
