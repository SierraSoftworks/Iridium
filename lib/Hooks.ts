export interface Hooks<TDocument, TInstance> {
    onCreating? (document: TDocument): Promise<any> | PromiseLike<any> | void;
    onRetrieved? (document: TDocument): Promise<any> | PromiseLike<any> | void;
    onReady? (instance: TInstance): Promise<any> | PromiseLike<any> | void;
    onSaving?(instance: TInstance, changes: any): Promise<any> | PromiseLike<any> | void;
}