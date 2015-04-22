/// <reference path="../../_references.d.ts" />
import cacheDirector = require('../CacheDirector');

export = IDCacheDirector;

class IDCacheDirector implements cacheDirector{
    valid(object: { _id: any }) {
        return object._id;
    }

    buildKey(object: { _id: any }) {
        return JSON.stringify(object._id);
    }
}