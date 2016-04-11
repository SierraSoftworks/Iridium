"use strict";
var MongoDB = require("mongodb");
/**
 * Caches documents using their _id field as the unique cache key. This
 * is useful if you primarily query your documents using their _id field,
 * however can be suboptimal (or even a complete waste) if you use different
 * types of queries.
 */
var CacheOnID = (function () {
    function CacheOnID() {
    }
    CacheOnID.prototype.valid = function (object) {
        return !!object._id;
    };
    CacheOnID.prototype.buildKey = function (object) {
        if (object._id._bsontype === "ObjectID")
            return new MongoDB.ObjectID(object._id.id).toHexString();
        return object._id;
    };
    CacheOnID.prototype.validQuery = function (conditions) {
        return !!conditions._id;
    };
    CacheOnID.prototype.buildQueryKey = function (conditions) {
        if (conditions._id._bsontype === "ObjectID")
            return new MongoDB.ObjectID(conditions._id.id).toHexString();
        return conditions._id;
    };
    return CacheOnID;
}());
exports.CacheOnID = CacheOnID;
