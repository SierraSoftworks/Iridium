var Bluebird = require('bluebird');
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
})();
exports.default = NoOpCache;

//# sourceMappingURL=../../lib/caches/NoOpCache.js.map