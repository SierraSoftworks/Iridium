import {Model} from "./Model";

/**
 * A centralized class which ties the cache and cache directors together in a cohesive way
 * for use by Iridium.
 * @internal
 */
export class ModelCache {
    constructor(public model: Model<any,any>) {

    }

    set<T>(value: T): void {
        if (!this.model.cacheDirector || !this.model.cacheDirector.valid(value)) return;
        this.model.core.cache.set(this.model.cacheDirector.buildKey(value), value);
    }

    get<T>(conditions: any): Promise<T|null> {
        if (!this.model.cacheDirector || !this.model.cacheDirector.validQuery(conditions)) return Promise.resolve<T|null>(null);
        return Promise.resolve(this.model.core.cache.get<T>(this.model.cacheDirector.buildQueryKey(conditions)));
    }

    clear(conditions: any): void {
        if (!this.model.cacheDirector || !this.model.cacheDirector.validQuery(conditions)) return;
        this.model.core.cache.clear(this.model.cacheDirector.buildQueryKey(conditions));
    }
}
