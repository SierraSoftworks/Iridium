/// <reference path="../_references.d.ts" />
import MongoDB = require('mongodb');
import Index = require('./Index');
import Hooks = require('./Hooks');
import {CacheDirector} from './CacheDirector';
import * as General from './General';

export interface QueryOptions {
    cache?: boolean;
    fields?: { [name: string]: number };
    limit?: number;
    skip?: number;
    sort?: Index.IndexSpecification;
}

export interface CreateOptions {
    w?: any;
    wtimeout?: number;
    j?: number;
    serializeFunctions?: boolean;
    forceServerObjectId?: boolean;
    upsert?: boolean;
    cache?: boolean;
}

export interface UpdateOptions {
    w?: any;
    wtimeout?: number;
    j?: boolean;
    upsert?: boolean;
}

export interface RemoveOptions {
    w?: any;
    wtimeout?: number;
    j?: boolean;
    single?: boolean;
}

export interface ModelOptions<TDocument, TInstance> {
    validators?: Skmatc.Validator[];
    cache?: CacheDirector;
    indexes?: (Index.Index | Index.IndexSpecification)[];
    identifier?: {
        apply(fromSource: any): any;
        reverse(toSource: any): any;
    };
}