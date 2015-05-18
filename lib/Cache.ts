import Bluebird = require('bluebird');

export = ICache;

interface ICache {
    set<T>(key: string, value: T): void;
    get<T>(key: string): Bluebird<T>;
    clear(key: string): void
}