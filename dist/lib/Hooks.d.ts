export interface Hooks<TDocument, TInstance> {
    onCreating?(document: TDocument): Promise<any> | PromiseLike<any> | any | never;
    onRetrieved?(document: TDocument): Promise<any> | PromiseLike<any> | any | never;
    onReady?(instance: TInstance): Promise<any> | PromiseLike<any> | any | never;
    onSaving?(instance: TInstance, changes: any): Promise<any> | PromiseLike<any> | any | never;
}
