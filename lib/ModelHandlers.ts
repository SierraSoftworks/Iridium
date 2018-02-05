import {Core} from "./Core";
import {Schema} from "./Schema";
import {Model} from "./Model";
import {ModelCache} from "./ModelCache";
import * as ModelOptions from "./ModelOptions";

import * as Skmatc from "skmatc";
import * as _ from "lodash";
import * as MongoDB from "mongodb";

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

    // TODO: Add documentation
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

    // TODO: Add documentation
    creatingDocuments(documents: TDocument[]): Promise<any[]> {
        return Promise.all(documents.map((document: any) => {
            return Promise
                // If onCreating returns a Promise promise then there is no significant performance overhead here
                .resolve(this.model.hooks.onCreating && this.model.hooks.onCreating(document))
                .then(() => {
                    document = this.model.helpers.convertToDB(document, { document: true, properties: true });
                    let validation: Skmatc.Result = this.model.helpers.validate(document);
                    if (validation.failed) return Promise.reject(validation.error);

                    // Only process the renames after performing validation
                    return this.model.helpers.convertToDB(document, { renames: true }, false);
                });
        }));
    }

    // TODO: Add documentation
    savingDocument(instance: TInstance, changes: any): Promise<TInstance> {
        return Promise
            // If onSaving returns a Promise promise then there is no significant performance overhead here
            .resolve(this.model.hooks.onSaving && this.model.hooks.onSaving(instance, changes))
            .then(() => {
                return instance;
            });
    }
}
