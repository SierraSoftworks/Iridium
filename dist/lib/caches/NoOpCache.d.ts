import { Cache } from "../Cache";
/**
 * A cache implementation which does not cache any received documents
 * and returns nothing when requested - mimicking an empty cache.
 *
 * This is the default cache used if one is not supplied and should
 * not impose any significant performance overhead.
 */
export declare class NoOpCache implements Cache {
    set<T>(key: string, object: T): PromiseLike<T>;
    get<T>(key: string): PromiseLike<T>;
    clear(key: string): PromiseLike<boolean>;
}
