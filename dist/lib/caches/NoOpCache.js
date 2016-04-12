"use strict";
var Bluebird = require("bluebird");
/**
 * A cache implementation which does not cache any received documents
 * and returns nothing when requested - mimicking an empty cache.
 *
 * This is the default cache used if one is not supplied and should
 * not impose any significant performance overhead.
 */
var NoOpCache = (function () {
    function NoOpCache() {
    }
    NoOpCache.prototype.set = function (key, object) {
        return Bluebird.resolve(object);
    };
    NoOpCache.prototype.get = function (key) {
        return Bluebird.resolve();
    };
    NoOpCache.prototype.clear = function (key) {
        return Bluebird.resolve(false);
    };
    return NoOpCache;
}());
exports.NoOpCache = NoOpCache;
//# sourceMappingURL=NoOpCache.js.map