// TODO: Add documentation
export interface Hooks<TDocument, TInstance> {

    // TODO: Add documentation
    onCreating? (document: TDocument): Promise<any> | PromiseLike<any> | any | never;

    // TODO: Add documentation
    onRetrieved? (document: TDocument): Promise<any> | PromiseLike<any> | any | never;

    // TODO: Add documentation
    onReady? (instance: TInstance): Promise<any> | PromiseLike<any> | any | never;

    // TODO: Add documentation
    onSaving?(instance: TInstance, changes: any): Promise<any> | PromiseLike<any> | any | never;
}