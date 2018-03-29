import {Core} from "./Core";
import {Schema} from "./Schema";
import {Model, InsertionDocument} from "./Model";
import {ModelCache} from "./ModelCache";
import * as ModelOptions from "./ModelOptions";

import * as Skmatc from "skmatc";
import * as _ from "lodash";
import * as MongoDB from "mongodb";
import { TransformOptions } from "./ModelHelpers";

/**
 * Provides a number of methods which are used to handle events that occur within
 * the Iridium workflow - such as what happens when a document is received from
 * the database, or how to handle the creation of new documents and saving of instances.
 *
 * Mostly this is for cache support, wrapping and hook triggering.
 * @internal
 */
export class ModelHandlers<TDocument extends { _id?: any }, TInstance> {
    constructor(public model: Model<TDocument, TInstance>) {

    }

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
    documentReceived<TResult>(conditions: any,
        result: TDocument,
        wrapper: (document: TDocument, isNew?: boolean, isPartial?: boolean) => TResult,
        options: ModelOptions.QueryOptions = {}): Promise<TResult> {
        _.defaults(options, {
            cache: true,
            partial: false
        });

        let wrapped: TResult;
        return Promise.resolve(this.model.helpers.transformFromDB(result, { document: true, renames: true })).then((target: any) => {
            return <Promise<TResult>>Promise
                // If onRetrieved returns a Promise promise then there is no significant performance overhead here
                .resolve(this.model.hooks.onRetrieved && this.model.hooks.onRetrieved(target))
                .then(() => {
                    // Cache the document if caching is enabled
                    if (this.model.core.cache && options.cache && !options.fields) {
                        this.model.cache.set(target); // Does not block execution pipeline - fire and forget
                    }

                    // Wrap the document and trigger the ready hook
                    let wrapped: TResult = wrapper(target, false, !!options.fields);

                    // Only incur the additional promise's performance penalty if this hook is being used
                    if (this.model.hooks.onReady)
                        return Promise
                            .resolve(this.model.hooks.onReady(<TInstance><any>wrapped))
                            .then(() => wrapped);
                    return wrapped;
                });
        });
    }

    /**
     * Called by methods which will create a new document in the DB. Responsible for
     * dispatching hooks, performing data validation and processing any necessary
     * transforms.
     * @param documents The list of documents which will be inserted. For single inserts an array of one document may be provided.
     * @param transformOptions Options which can be used to control how the transforms are applied when representing the document
     */
    creatingDocuments(documents: InsertionDocument<TDocument>[], transformOptions: TransformOptions = {}): Promise<any[]> {
        return Promise.all(documents.map((document: any) => {

            // When we're working with "complex" insertion documents (which have a toDB() method)
            // we should avoid transforming the properties of that document - since they should already
            // be transformed.
            if (document && typeof document.toDB === "function") {
                document = document.toDB()

                _.defaults(transformOptions, { properties: false })
            }

            _.defaults(transformOptions, { document: true, renames: true, properties: true })

            return Promise
                // If onCreating returns a Promise promise then there is no significant performance overhead here
                .resolve(this.model.hooks.onCreating && this.model.hooks.onCreating(document))
                .then(() => {
                    document = this.model.helpers.convertToDB(document, { document: transformOptions.document, properties: transformOptions.properties });
                    let validation: Skmatc.Result = this.model.helpers.validate(document);
                    if (validation.failed) return Promise.reject(validation.error);

                    // Only process the renames after performing validation
                    return this.model.helpers.convertToDB(document, { renames: transformOptions.renames }, false);
                });
        }));
    }

    /**
     * Called by Instance methods before an Instance is saved to the databse.
     * Will only be called if there are changes to be saved and will ensure that
     * the `onSaving` hook is called if it is set.
     * @param instance The instance which is being saved to the database
     * @param changes The list of changes that have been made to this instance since it was retrieved from the DB
     */
    savingDocument(instance: TInstance, changes: any): Promise<TInstance> {
        return Promise
            // If onSaving returns a Promise promise then there is no significant performance overhead here
            .resolve(this.model.hooks.onSaving && this.model.hooks.onSaving(instance, changes))
            .then(() => {
                return instance;
            });
    }
}
