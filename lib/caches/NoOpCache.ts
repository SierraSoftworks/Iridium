import {Cache} from "../Cache";

/**
 * A cache implementation which does not cache any received documents
 * and returns nothing when requested - mimicking an empty cache.
 *
 * This is the default cache used if one is not supplied and should
 * not impose any significant performance overhead.
 */
export class NoOpCache implements Cache {
    set<T>(key: string, object: T): PromiseLike<T> {
        return Promise.resolve(object);
    }

    get<T>(key: string): PromiseLike<T> {
        return Promise.resolve<T>(<any>undefined);
    }

    clear(key: string): PromiseLike<boolean> {
        return Promise.resolve(false);
    }
}