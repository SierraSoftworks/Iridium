/// <reference path="../../_references.d.ts" />
import cacheDirector = require('../CacheDirector');
export = IDCacheDirector;
declare class IDCacheDirector implements cacheDirector {
    valid(object: {
        _id: any;
    }): any;
    buildKey(object: {
        _id: any;
    }): string;
}
