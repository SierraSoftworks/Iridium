import { Cache } from "../Cache";
import Bluebird = require("bluebird");
/**
 * A cache implementation which does not cache any received documents
 * and returns nothing when requested - mimicking an empty cache.
 *
 * This is the default cache used if one is not supplied and should
 * not impose any significant performance overhead.
 */
export declare class NoOpCache implements Cache {
    set<T>(key: string, object: T): Bluebird<T>;
    get<T>(key: string): Bluebird<void>;
    clear(key: string): Bluebird<boolean>;
}
