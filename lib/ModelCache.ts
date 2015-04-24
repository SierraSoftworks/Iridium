/// <reference path="../_references.d.ts" />
import ModelInterfaces = require('./ModelInterfaces');

export = ModelCache;

class ModelCache {
    constructor(public model: ModelInterfaces.IModelBase) {

    }

    set<T>(value: T): Promise<T> {
        if (!this.model.cacheDirector || !this.model.cacheDirector.valid(value)) return Promise.resolve(value);
        return this.model.core.cache.set(this.model.cacheDirector.buildKey(value), value);
    }

    get<T>(conditions: any): Promise<T> {
        if (!this.model.cacheDirector || !this.model.cacheDirector.validQuery(conditions)) return Promise.resolve(<T>null);
        return this.model.core.cache.get<T>(this.model.cacheDirector.buildQueryKey(conditions));
    }

    clear(conditions: any): Promise<boolean> {
        if (!this.model.cacheDirector || !this.model.cacheDirector.validQuery(conditions)) return Promise.resolve(false);
        return this.model.core.cache.clear(this.model.cacheDirector.buildQueryKey(conditions));
    }
}
