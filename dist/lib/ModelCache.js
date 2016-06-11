"use strict";
const Bluebird = require("bluebird");
/**
 * A centralized class which ties the cache and cache directors together in a cohesive way
 * for use by Iridium.
 * @internal
 */
class ModelCache {
    constructor(model) {
        this.model = model;
    }
    set(value) {
        if (!this.model.cacheDirector || !this.model.cacheDirector.valid(value))
            return;
        this.model.core.cache.set(this.model.cacheDirector.buildKey(value), value);
    }
    get(conditions) {
        if (!this.model.cacheDirector || !this.model.cacheDirector.validQuery(conditions))
            return Bluebird.resolve(null);
        return Bluebird.resolve(this.model.core.cache.get(this.model.cacheDirector.buildQueryKey(conditions)));
    }
    clear(conditions) {
        if (!this.model.cacheDirector || !this.model.cacheDirector.validQuery(conditions))
            return;
        this.model.core.cache.clear(this.model.cacheDirector.buildQueryKey(conditions));
    }
}
exports.ModelCache = ModelCache;

//# sourceMappingURL=ModelCache.js.map
