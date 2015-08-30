/// <reference path="../../_references.d.ts" />
import {Cache} from '../Cache';
import Bluebird = require('bluebird');

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