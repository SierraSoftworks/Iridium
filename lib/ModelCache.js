var Promise = require('bluebird');
var ModelCache = (function () {
    function ModelCache(model) {
        this.model = model;
    }
    ModelCache.prototype.set = function (value) {
        if (!this.model.cacheDirector || !this.model.cacheDirector.valid(value))
            return Promise.resolve(value);
        return this.model.core.cache.set(this.model.cacheDirector.buildKey(value), value);
    };
    ModelCache.prototype.get = function (conditions) {
        if (!this.model.cacheDirector || !this.model.cacheDirector.validQuery(conditions))
            return Promise.resolve(null);
        return this.model.core.cache.get(this.model.cacheDirector.buildQueryKey(conditions));
    };
    ModelCache.prototype.clear = function (conditions) {
        if (!this.model.cacheDirector || !this.model.cacheDirector.validQuery(conditions))
            return Promise.resolve(false);
        return this.model.core.cache.clear(this.model.cacheDirector.buildQueryKey(conditions));
    };
    return ModelCache;
})();
module.exports = ModelCache;
//# sourceMappingURL=ModelCache.js.map