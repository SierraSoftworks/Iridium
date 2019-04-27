import { CacheDirector } from "../CacheDirector";
/**
 * Caches documents using their _id field as the unique cache key. This
 * is useful if you primarily query your documents using their _id field,
 * however can be suboptimal (or even a complete waste) if you use different
 * types of queries.
 */
export declare class CacheOnID implements CacheDirector {
    valid<T>(object: T): boolean;
    buildKey<T>(object: T): any;
    validQuery(conditions: {
        _id?: any;
        [prop: string]: any;
    }): boolean;
    buildQueryKey(conditions: {
        _id: any;
        [prop: string]: any;
    }): any;
}
