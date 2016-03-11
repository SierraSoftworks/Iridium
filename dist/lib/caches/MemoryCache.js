"use strict";
var Bluebird = require("bluebird");
/**
 * A cache implementation which stores documents in an in-memory cache.
 *
 * Be aware that this is an incredibly simplistic implementation which doesn't manage
 * memory usage at all and is very likely NOT suitable for production use.
 */
var MemoryCache = (function () {
    function MemoryCache() {
        this.cache = {};
    }
    MemoryCache.prototype.set = function (key, value) {
        this.cache[key] = value;
        return Bluebird.resolve(value);
    };
    MemoryCache.prototype.get = function (key) {
        return Bluebird.resolve(this.cache[key]);
    };
    MemoryCache.prototype.clear = function (key) {
        var has = this.cache.hasOwnProperty(key);
        if (has)
            delete this.cache[key];
        return Bluebird.resolve(has);
    };
    return MemoryCache;
}());
exports.MemoryCache = MemoryCache;

//# sourceMappingURL=MemoryCache.js.map
