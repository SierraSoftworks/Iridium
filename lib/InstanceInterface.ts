/// <reference path="../_references.d.ts" />
import {Schema} from './Schema';
import {Model} from './Model';
import * as Index from './Index';
import {CacheDirector} from './CacheDirector';

export interface InstanceImplementation<TDocument extends { _id ?: any }, TInstance> {
    new (model: Model<TDocument, TInstance>, doc: TDocument, isNew?: boolean, isPartial?: boolean): TInstance;
    
    collection: string;
    schema: Schema;
    indexes?: (Index.Index | Index.IndexSpecification)[];
    
    onCreating? (document: TDocument): void;
    onRetrieved? (document: TDocument): void;
    onReady? (instance: TInstance): void;
    onSaving? (instance: TInstance, changes: any): void;

    cache?: CacheDirector;
    validators?: Skmatc.Validator[];
    transforms?: { [property: string]: { fromDB: (value: any) => any; toDB: (value: any) => any; } };
}