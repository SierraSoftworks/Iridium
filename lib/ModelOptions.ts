/// <reference path="../_references.d.ts" />
import MongoDB = require('mongodb');
import Index = require('./Index');
import Hooks = require('./Hooks');
import CacheDirector = require('./CacheDirector');
import General = require('./General');

export interface QueryOptions {
    cache?: boolean;
    fields?: { [name: string]: number };
    limit?: number;
    skip?: number;
    sort?: Index.IndexSpecification;
}

export interface CreateOptions {
    w?: any;
    upsert?: boolean;
    cache?: boolean;
}

export interface UpdateOptions {
    w?: any;
    multi?: boolean;
}

export interface IModelOptions<TDocument, TInstance> {
    hooks?: Hooks<TDocument, TInstance>;
    validators?: SkmatcCore.IValidator[];
    cache?: CacheDirector;
    indexes?: (Index.Index | Index.IndexSpecification)[];
    properties?: { [key: string]: (General.PropertyGetter<any> | General.Property<any>) };
    identifier?: Concoction.Ingredient;
}