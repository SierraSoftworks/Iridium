/// <reference path="../_references.d.ts" />
import instance = require('./Instance');

export = IHooks;

interface IHooks<TDocument, TInstance> {
    creating? (document: TDocument): void;
    retrieved? (document: TDocument): void;
    ready? (instance: TInstance): void;
    saving? (instance: TInstance, changes: any): void;
}