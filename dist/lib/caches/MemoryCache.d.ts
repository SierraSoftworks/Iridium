import { Cache } from "../Cache";
/**
 * A cache implementation which stores documents in an in-memory cache.
 *
 * Be aware that this is an incredibly simplistic implementation which doesn't manage
 * memory usage at all and is very likely NOT suitable for production use.
 */
export declare class MemoryCache implements Cache {
    private cache;
    set<T>(key: string, value: T): PromiseLike<T>;
    get<T>(key: string): PromiseLike<T>;
    clear(key: string): PromiseLike<boolean>;
}
