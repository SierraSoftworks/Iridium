/// <reference path="../_references.d.ts" />
import Bluebird = require('bluebird');

export = ICache;

interface ICache {
    set<T>(key: string, value: T): Bluebird<T>;
    get<T>(key: string): Bluebird<T>;
    clear(key: string): Bluebird<boolean>
}