import instance = require("./Instance");

export interface Hooks<TDocument, TInstance> {
    onCreating? (document: TDocument): Promise.Thenable<any> | void;
    onRetrieved? (document: TDocument): Promise.Thenable<any> | void;
    onReady? (instance: TInstance): Promise.Thenable<any> | void;
    onSaving?(instance: TInstance, changes: any): Promise.Thenable<any> | void;
}