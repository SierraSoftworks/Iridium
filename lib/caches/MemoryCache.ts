/// <reference path='../../typings/bluebird/bluebird.d.ts' />
import Promise = require('bluebird');
import cache = require('../Cache');

export = MemoryCache;

class MemoryCache implements cache {
    private cache: any = {};

    set<T>(key: string, value: T): Promise<T> {
        this.cache[key] = value;
        return Promise.resolve(value);
    }

    get<T>(key: string): Promise<T> {
        return Promise.resolve(this.cache[key]);
    }

    clear(key: string) : Promise<boolean> {
        var has = this.cache.hasOwnProperty(key);
        if(has) delete this.cache[key];
        return Promise.resolve(has);
    }
}