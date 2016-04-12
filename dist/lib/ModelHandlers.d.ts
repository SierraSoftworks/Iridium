import { Model } from "./Model";
import * as ModelOptions from "./ModelOptions";
import * as Bluebird from "bluebird";
/**
 * Provides a number of methods which are used to handle events that occur within
 * the Iridium workflow - such as what happens when a document is received from
 * the database, or how to handle the creation of new documents and saving of instances.
 *
 * Mostly this is for cache support, wrapping and hook triggering.
 * @internal
 */
export declare class ModelHandlers<TDocument extends {
    _id?: any;
}, TInstance> {
    model: Model<TDocument, TInstance>;
    constructor(model: Model<TDocument, TInstance>);
    documentReceived<TResult>(conditions: any, result: TDocument, wrapper: (document: TDocument, isNew?: boolean, isPartial?: boolean) => TResult, options?: ModelOptions.QueryOptions): Bluebird<TResult>;
    creatingDocuments(documents: TDocument[]): Bluebird<any[]>;
    savingDocument(instance: TInstance, changes: any): Bluebird<TInstance>;
}
