export interface Hooks<TDocument, TInstance> {
    onCreating?(document: TDocument): Promise<any> | void;
    onRetrieved?(document: TDocument): Promise<any> | void;
    onReady?(instance: TInstance): Promise<any> | void;
    onSaving?(instance: TInstance, changes: any): Promise<any> | void;
}
