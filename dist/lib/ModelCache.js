var Bluebird = require('bluebird');
/**
 * A centralized class which ties the cache and cache directors together in a cohesive way
 * for use by Iridium.
 * @internal
 */
var ModelCache = (function () {
    function ModelCache(model) {
        this.model = model;
    }
    ModelCache.prototype.set = function (value) {
        if (!this.model.cacheDirector || !this.model.cacheDirector.valid(value))
            return;
        this.model.core.cache.set(this.model.cacheDirector.buildKey(value), value);
    };
    ModelCache.prototype.get = function (conditions) {
        if (!this.model.cacheDirector || !this.model.cacheDirector.validQuery(conditions))
            return Bluebird.resolve(null);
        return this.model.core.cache.get(this.model.cacheDirector.buildQueryKey(conditions));
    };
    ModelCache.prototype.clear = function (conditions) {
        if (!this.model.cacheDirector || !this.model.cacheDirector.validQuery(conditions))
            return;
        this.model.core.cache.clear(this.model.cacheDirector.buildQueryKey(conditions));
    };
    return ModelCache;
})();
exports.ModelCache = ModelCache;

//# sourceMappingURL=../lib/ModelCache.js.map