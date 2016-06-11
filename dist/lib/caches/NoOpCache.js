"use strict";
const Bluebird = require("bluebird");
/**
 * A cache implementation which does not cache any received documents
 * and returns nothing when requested - mimicking an empty cache.
 *
 * This is the default cache used if one is not supplied and should
 * not impose any significant performance overhead.
 */
class NoOpCache {
    set(key, object) {
        return Bluebird.resolve(object);
    }
    get(key) {
        return Bluebird.resolve();
    }
    clear(key) {
        return Bluebird.resolve(false);
    }
}
exports.NoOpCache = NoOpCache;

//# sourceMappingURL=NoOpCache.js.map
