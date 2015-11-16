import instance = require('./Instance');
import Bluebird = require('bluebird');

export interface Hooks<TDocument, TInstance> {
    onCreating? (document: TDocument): Promise.Thenable<void> | void;
    onRetrieved? (document: TDocument): Promise.Thenable<void> | void;
    onReady? (instance: TInstance): Promise.Thenable<void> | void;
    onSaving? (instance: TInstance, changes: any): Promise.Thenable<void> | void;
}