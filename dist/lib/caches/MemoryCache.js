"use strict";
const Bluebird = require("bluebird");
/**
 * A cache implementation which stores documents in an in-memory cache.
 *
 * Be aware that this is an incredibly simplistic implementation which doesn't manage
 * memory usage at all and is very likely NOT suitable for production use.
 */
class MemoryCache {
    constructor() {
        this.cache = {};
    }
    set(key, value) {
        this.cache[key] = value;
        return Bluebird.resolve(value);
    }
    get(key) {
        return Bluebird.resolve(this.cache[key]);
    }
    clear(key) {
        let has = this.cache.hasOwnProperty(key);
        if (has)
            delete this.cache[key];
        return Bluebird.resolve(has);
    }
}
exports.MemoryCache = MemoryCache;

//# sourceMappingURL=MemoryCache.js.map
