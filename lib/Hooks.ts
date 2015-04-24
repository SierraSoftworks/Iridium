/// <reference path="../_references.d.ts" />
import instance = require('./Instance');

export = IHooks;

interface IHooks<TDocument, TInstance> {
    creating? (document: TDocument);
    retrieved? (document: TDocument);
    ready? (instance: TInstance);
    saving? (instance: TInstance, changes: any);
}