/// <reference path="../_references.d.ts" />
export interface ModelSpecificInstanceConstructor<TDocument extends { _id?: any }, TInstance> {
    new (doc: TDocument, isNew?: boolean, isPartial?: boolean): TInstance;
}