/// <reference path="../../_references.d.ts" />
import Bluebird = require('bluebird');
import {Cache} from '../Cache';

/**
 * A cache implementation which stores documents in an in-memory cache.
 * 
 * Be aware that this is an incredibly simplistic implementation which doesn't manage
 * memory usage at all and is very likely NOT suitable for production use.
 */
export class MemoryCache implements Cache {
    private cache: any = {};

    set<T>(key: string, value: T): Bluebird<T> {
        this.cache[key] = value;
        return Bluebird.resolve(value);
    }

    get<T>(key: string): Bluebird<T> {
        return Bluebird.resolve(this.cache[key]);
    }

    clear(key: string) : Bluebird<boolean> {
        var has = this.cache.hasOwnProperty(key);
        if(has) delete this.cache[key];
        return Bluebird.resolve(has);
    }
}