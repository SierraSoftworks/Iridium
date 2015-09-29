import Bluebird = require('bluebird');

export interface Cache {
    set<T>(key: string, value: T): void;
    get<T>(key: string): Bluebird<T>;
    clear(key: string): void
}