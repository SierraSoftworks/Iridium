/// <reference path="../../_references.d.ts" />
var Promise = require('bluebird');
var MemoryCache = (function () {
    function MemoryCache() {
        this.cache = {};
    }
    MemoryCache.prototype.set = function (key, value) {
        this.cache[key] = value;
        return Promise.resolve(value);
    };
    MemoryCache.prototype.get = function (key) {
        return Promise.resolve(this.cache[key]);
    };
    MemoryCache.prototype.clear = function (key) {
        var has = this.cache.hasOwnProperty(key);
        if (has)
            delete this.cache[key];
        return Promise.resolve(has);
    };
    return MemoryCache;
})();
module.exports = MemoryCache;
//# sourceMappingURL=MemoryCache.js.map