"use strict";
const _ = require("lodash");
const Bluebird = require("bluebird");
/**
 * Provides a number of methods which are used to handle events that occur within
 * the Iridium workflow - such as what happens when a document is received from
 * the database, or how to handle the creation of new documents and saving of instances.
 *
 * Mostly this is for cache support, wrapping and hook triggering.
 * @internal
 */
class ModelHandlers {
    constructor(model) {
        this.model = model;
    }
    documentReceived(conditions, result, wrapper, options = {}) {
        _.defaults(options, {
            cache: true,
            partial: false
        });
        let wrapped;
        return Bluebird.resolve(this.model.helpers.transformFromDB(result, { document: true })).then((target) => {
            return Bluebird
                .resolve(this.model.hooks.onRetrieved && this.model.hooks.onRetrieved(target))
                .then(() => {
                // Cache the document if caching is enabled
                if (this.model.core.cache && options.cache && !options.fields) {
                    this.model.cache.set(target); // Does not block execution pipeline - fire and forget
                }
                // Wrap the document and trigger the ready hook
                let wrapped = wrapper(target, false, !!options.fields);
                // Only incur the additional promise's performance penalty if this hook is being used
                if (this.model.hooks.onReady)
                    return Bluebird
                        .resolve(this.model.hooks.onReady(wrapped))
                        .then(() => wrapped);
                return wrapped;
            });
        });
    }
    creatingDocuments(documents) {
        return Bluebird.all(documents.map((document) => {
            return Bluebird
                .resolve(this.model.hooks.onCreating && this.model.hooks.onCreating(document))
                .then(() => {
                document = this.model.helpers.convertToDB(document, { document: true, properties: true });
                let validation = this.model.helpers.validate(document);
                if (validation.failed)
                    return Bluebird.reject(validation.error);
                return document;
            });
        }));
    }
    savingDocument(instance, changes) {
        return Bluebird
            .resolve(this.model.hooks.onSaving && this.model.hooks.onSaving(instance, changes))
            .then(() => {
            return instance;
        });
    }
}
exports.ModelHandlers = ModelHandlers;

//# sourceMappingURL=ModelHandlers.js.map
