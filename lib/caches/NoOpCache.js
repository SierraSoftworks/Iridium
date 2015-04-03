var Promise = require('bluebird');
var NoOpCache = (function () {
    function NoOpCache() {
    }
    NoOpCache.prototype.set = function (key, object) {
        return Promise.resolve(object);
    };
    NoOpCache.prototype.get = function (key) {
        return Promise.resolve();
    };
    NoOpCache.prototype.clear = function (key) {
        return Promise.resolve(false);
    };
    return NoOpCache;
})();
module.exports = NoOpCache;
//# sourceMappingURL=NoOpCache.js.map