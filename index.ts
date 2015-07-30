import Core from './lib/Core';
import Model from './lib/Model';
import Instance from './lib/Instance';
export {Core, Model, Instance};

export * from './lib/Decorators';

export * from './lib/Plugins';
export * from './lib/Schema';
export * from './lib/Cache';
export * from './lib/CacheDirector';
export * from './lib/ModelOptions';
export * from './lib/Configuration';
export * from './lib/Hooks';

import MemoryCache from './lib/caches/MemoryCache';
import NoOpCache from './lib/caches/NoOpCache';
export {MemoryCache, NoOpCache};

import IDDirector from './lib/cacheControllers/IDDirector';
export {IDDirector as CacheOnID};

import {toObjectID} from './lib/utils/ObjectID';
export {toObjectID};