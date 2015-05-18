import cache = require('../Cache');
import Bluebird = require('bluebird');

export = NoOpCache;

class NoOpCache implements cache {
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