/// <reference path="../../_references.d.ts" />
import cache = require('../Cache');
import Promise = require('bluebird');

export = NoOpCache;

class NoOpCache implements cache {
    set<T>(key: string, object: T): Promise<T> {
        return Promise.resolve(object);
    }

    get<T>(key: string): Promise<void> {
        return Promise.resolve();
    }

    clear(key: string): Promise<boolean> {
        return Promise.resolve(false);
    }
}