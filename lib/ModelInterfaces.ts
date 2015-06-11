/// <reference path="../_references.d.ts" />
import Iridium from './Core';
import {Schema} from './Schema';
import MongoDB = require('mongodb');
import Model from './Model';
import ModelCache from './ModelCache';
import {CacheDirector} from './CacheDirector';
import {Hooks} from './Hooks';
import * as ModelOptions from './ModelOptions';

export interface IModelBase {
    collection: MongoDB.Collection;
    collectionName: string;
    core: Iridium;
    schema: Schema;
    cache: ModelCache;
    cacheDirector: CacheDirector;
}

export interface IModel<TDocument extends { _id?: any }, TInstance> extends IModelBase {
    Instance: new (doc: TDocument, isNew?: boolean, isPartial?: boolean) => TInstance;
}

export interface InstanceImplementation<TDocument extends { _id?: any }, TInstance> extends Hooks<TDocument, TInstance>, ModelOptions.ModelOptions<TDocument, TInstance> {
    new (model: Model<TDocument, TInstance>, doc: TDocument, isNew?: boolean, isPartial?: boolean): TInstance;
}

export interface InstanceCreator<TDocument extends { _id?: any }, TInstance> {
    (model: Model<TDocument, TInstance>, doc: TDocument, isNew?: boolean, isPartial?: boolean): TInstance;
}

export interface ModelSpecificInstanceConstructor<TDocument extends { _id?: any }, TInstance> {
    new (doc: TDocument, isNew?: boolean, isPartial?: boolean): TInstance;
}