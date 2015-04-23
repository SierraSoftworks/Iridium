/// <reference path="../../_references.d.ts" />
import Promise = require('bluebird');
import cache = require('../Cache');
export = MemoryCache;
declare class MemoryCache implements cache {
    private cache;
    set<T>(key: string, value: T): Promise<T>;
    get<T>(key: string): Promise<T>;
    clear(key: string): Promise<boolean>;
}
