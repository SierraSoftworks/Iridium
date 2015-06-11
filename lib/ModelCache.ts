/// <reference path="../_references.d.ts" />
import * as ModelInterfaces from './ModelInterfaces';
import Bluebird = require('bluebird');

export default class ModelCache {
    constructor(public model: ModelInterfaces.IModelBase) {

    }

    set<T>(value: T): void {
        if (!this.model.cacheDirector || !this.model.cacheDirector.valid(value)) return;;
        this.model.core.cache.set(this.model.cacheDirector.buildKey(value), value);
    }

    get<T>(conditions: any): Bluebird<T> {
        if (!this.model.cacheDirector || !this.model.cacheDirector.validQuery(conditions)) return Bluebird.resolve(<T>null);
        return this.model.core.cache.get<T>(this.model.cacheDirector.buildQueryKey(conditions));
    }

    clear(conditions: any): void {
        if (!this.model.cacheDirector || !this.model.cacheDirector.validQuery(conditions)) return;
        this.model.core.cache.clear(this.model.cacheDirector.buildQueryKey(conditions));
    }
}
