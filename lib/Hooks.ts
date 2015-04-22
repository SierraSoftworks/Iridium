/// <reference path="../_references.d.ts" />
import instance = require('./Instance');

export interface IHooks<TDocument, TInstance> {
    creating? (document: TDocument);
    retrieved? (document: TDocument);
    ready? (instance: TInstance);
    beforeSave? (instance: TInstance);
    saving? (instance: TInstance, changes: any);
}