import {Cache} from '../Cache';
import Bluebird = require('bluebird');

/**
 * A cache implementation which does not cache any received documents
 * and returns nothing when requested - mimicking an empty cache.
 *
 * This is the default cache used if one is not supplied and should
 * not impose any significant performance overhead.
 */
export class NoOpCache implements Cache {
    set<T>(key: string, object: T): Bluebird<T> {
        return Bluebird.resolve(object);
    }

    get<T>(key: string): Bluebird<void> {
        return Bluebird.resolve();
    }

    clear(key: string): Bluebird<boolean> {
        return Bluebird.resolve(false);
    }
}