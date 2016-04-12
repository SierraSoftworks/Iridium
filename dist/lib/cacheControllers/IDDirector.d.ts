import { CacheDirector } from "../CacheDirector";
/**
 * Caches documents using their _id field as the unique cache key. This
 * is useful if you primarily query your documents using their _id field,
 * however can be suboptimal (or even a complete waste) if you use different
 * types of queries.
 */
export declare class CacheOnID implements CacheDirector {
    valid(object: {
        _id: any;
    }): boolean;
    buildKey(object: {
        _id: any;
    }): any;
    validQuery(conditions: any): boolean;
    buildQueryKey(conditions: any): any;
}
