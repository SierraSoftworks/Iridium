import _Core = require('./lib/Core');
import _Model = require('./lib/Model');
import _Instance = require('./lib/Instance');

import _Plugin = require('./lib/Plugins');
import _Schema = require('./lib/Schema');
import _Cache = require('./lib/Cache');
import _CacheDirector = require('./lib/CacheDirector');
import _ModelOptions = require('./lib/ModelOptions');
import _Configuration = require('./lib/Configuration');
import _Hooks = require('./lib/Hooks');

import _MemoryCache = require('./lib/caches/MemoryCache');
import _NoOpCache = require('./lib/caches/NoOpCache');

import _IDDirector = require('./lib/cacheControllers/IDDirector');

export = Iridium;

module Iridium {
    export class Core extends _Core { }
    export class Model<TDocument extends { _id?: any }, TInstance> extends _Model<TDocument, TInstance> { }
    export class Instance<TDocument extends { _id?: any }, TInstance> extends _Instance<TDocument, TInstance> { }

    export class NoOpCache extends _NoOpCache { }
    export class MemoryCache extends _MemoryCache { }

    export class CacheOnID extends _IDDirector { }

    export interface Configuration extends _Configuration { }
    export interface Hooks<TDocument, TInstance> extends _Hooks<TDocument, TInstance> { }
    export interface Plugin extends _Plugin { }
    export interface Schema extends _Schema { }
    export interface Cache extends _Cache { }
    export interface CacheDirector extends _CacheDirector { }
    export interface ModelOptions<TDocument, TInstance> extends _ModelOptions.IModelOptions<TDocument, TInstance> { }
}