"use strict";
const MongoDB = require("mongodb");
/**
 * Caches documents using their _id field as the unique cache key. This
 * is useful if you primarily query your documents using their _id field,
 * however can be suboptimal (or even a complete waste) if you use different
 * types of queries.
 */
class CacheOnID {
    valid(object) {
        return !!object._id;
    }
    buildKey(object) {
        if (object._id._bsontype === "ObjectID")
            return new MongoDB.ObjectID(object._id.id).toHexString();
        return object._id;
    }
    validQuery(conditions) {
        return !!conditions._id;
    }
    buildQueryKey(conditions) {
        if (conditions._id._bsontype === "ObjectID")
            return new MongoDB.ObjectID(conditions._id.id).toHexString();
        return conditions._id;
    }
}
exports.CacheOnID = CacheOnID;

//# sourceMappingURL=IDDirector.js.map
