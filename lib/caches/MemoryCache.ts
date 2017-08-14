import {Cache} from "../Cache";

/**
 * A cache implementation which stores documents in an in-memory cache.
 *
 * Be aware that this is an incredibly simplistic implementation which doesn't manage
 * memory usage at all and is very likely NOT suitable for production use.
 */
export class MemoryCache implements Cache {
    private cache: any = {};

    set<T>(key: string, value: T): PromiseLike<T> {
        this.cache[key] = value;
        return Promise.resolve(value);
    }

    get<T>(key: string): PromiseLike<T> {
        return Promise.resolve(this.cache[key]);
    }

    clear(key: string): PromiseLike<boolean> {
        let has = this.cache.hasOwnProperty(key);
        if(has) delete this.cache[key];
        return Promise.resolve(has);
    }
}