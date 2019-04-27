import { Model, InsertionDocument } from "./Model";
import * as ModelOptions from "./ModelOptions";
import { TransformOptions } from "./ModelHelpers";
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
    /**
     * Called by methods which retrieve a document from the database. This method
     * is responsible for performing any necessary transforms on the data, setting
     * the cache entry and wrapping the returned object in the relevant wrapper type
     * (usually an Instance). This method will also trigger the `onRetrieved` and `onReady`
     * hooks on the model at the correct times.
     *
     * @param conditions The conditions which were used to request the document from the DB
     * @param result The resulting document which was returned by the DB
     * @param wrapper The method which will be used to wrap the document, usually an Instance
     * @param options Options which may be provided to override the behaviour of this method
     */
    documentReceived<TResult>(conditions: any, result: TDocument, wrapper: (document: TDocument, isNew?: boolean, isPartial?: boolean) => TResult, options?: ModelOptions.QueryOptions): Promise<TResult>;
    /**
     * Called by methods which will create a new document in the DB. Responsible for
     * dispatching hooks, performing data validation and processing any necessary
     * transforms.
     * @param documents The list of documents which will be inserted. For single inserts an array of one document may be provided.
     * @param transformOptions Options which can be used to control how the transforms are applied when representing the document
     */
    creatingDocuments(documents: InsertionDocument<TDocument>[], transformOptions?: TransformOptions): Promise<any[]>;
    /**
     * Called by Instance methods before an Instance is saved to the databse.
     * Will only be called if there are changes to be saved and will ensure that
     * the `onSaving` hook is called if it is set.
     * @param instance The instance which is being saved to the database
     * @param changes The list of changes that have been made to this instance since it was retrieved from the DB
     */
    savingDocument(instance: TInstance, changes: any): Promise<TInstance>;
}
