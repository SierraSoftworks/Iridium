/// <reference path="./_references.d.ts" />

import _Core = require('./lib/Core');
import _Model = require('./lib/Model');
import _Instance = require('./lib/Instance');
import _Schema = require('./lib/Schema');
import _Cache = require('./lib/Cache');
import _CacheDirector = require('./lib/CacheDirector');

import _MemoryCache = require('./lib/caches/MemoryCache');
import _NoOpCache = require('./lib/caches/NoOpCache');

import _IDDirector = require('./lib/cacheControllers/IDDirector');

export = Iridium;

module Iridium {
    export class Core extends _Core { };
    export class Model<TDocument, TInstance> extends _Model<TDocument, TInstance> { };
    export class Instance<TDocument, TInstance> extends _Instance<TDocument, TInstance> { };

    export class NoOpCache extends _NoOpCache { };
    export class MemoryCache extends _MemoryCache { };

    export class CacheOnID extends _IDDirector { };

    export interface Schema extends _Schema { };
    export interface ICache extends _Cache { };
    export interface ICacheDirector extends _CacheDirector { };
};