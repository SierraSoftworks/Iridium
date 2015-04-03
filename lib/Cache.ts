/// <reference path='../typings/bluebird/bluebird.d.ts' />
import Promise = require('bluebird');

export = ICache;

interface ICache {
    set<T>(key: string, value: T): Promise<T>;
    get<T>(key: string): Promise<T>;
    clear(key: string): Promise<boolean>
}