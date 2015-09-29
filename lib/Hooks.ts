import instance = require('./Instance');

export interface Hooks<TDocument, TInstance> {
    onCreating? (document: TDocument): void;
    onRetrieved? (document: TDocument): void;
    onReady? (instance: TInstance): void;
    onSaving? (instance: TInstance, changes: any): void;
}