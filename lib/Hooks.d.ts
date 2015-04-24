/// <reference path="../_references.d.ts" />
export interface IHooks<TDocument, TInstance> {
    creating?(document: TDocument): any;
    retrieved?(document: TDocument): any;
    ready?(instance: TInstance): any;
    beforeSave?(instance: TInstance): any;
    saving?(instance: TInstance, changes: any): any;
}
