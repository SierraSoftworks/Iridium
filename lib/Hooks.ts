/// <reference path="../_references.d.ts" />
import instance = require('./Instance');

export = IHooks;

interface IHooks<TDocument, TInstance> {
    onCreating? (document: TDocument): void;
    onRetrieved? (document: TDocument): void;
    onReady? (instance: TInstance): void;
    onSaving? (instance: TInstance, changes: any): void;
}