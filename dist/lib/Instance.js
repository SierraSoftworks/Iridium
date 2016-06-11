"use strict";
const Validators_1 = require("./Validators");
const _ = require("lodash");
const Bluebird = require("bluebird");
/**
 * The default Iridium Instance implementation which provides methods for saving, refreshing and
 * removing the wrapped document from the collection, as well as integrating with Omnom, our
 * built in document diff processor which allows clean, atomic, document updates to be performed
 * without needing to write the update queries yourself.
 *
 * @param TDocument The interface representing the structure of the documents in the collection.
 * @param TInstance The type of instance which wraps the documents, generally the subclass of this class.
 *
 * This class will be subclassed automatically by Iridium to create a model specific instance
 * which takes advantage of some of v8's optimizations to boost performance significantly.
 * The instance returned by the model, and all of this instance's methods, will be of type
 * TInstance - which should represent the merger of TSchema and IInstance for best results.
 */
class Instance {
    /**
     * Creates a new instance which represents the given document as a type of model
     * @param model The model that dictates the collection the document originated from as well as how validations are performed.
     * @param document The document which should be wrapped by this instance
     * @param isNew Whether the document is new (doesn't exist in the database) or not
     * @param isPartial Whether the document has only a subset of its fields populated
     *
     */
    constructor(model, document, isNew = true, isPartial = false) {
        this._model = model;
        this._isNew = !!isNew;
        this._isPartial = isPartial;
        this._original = document;
        this._modified = model.helpers.cloneDocument(document);
        _.each(model.core.plugins, (plugin) => {
            if (plugin.newInstance)
                plugin.newInstance(this, model);
        });
    }
    /**
     * Gets the underlying document representation of this instance
     */
    get document() {
        return this._modified;
    }
    save(...args) {
        let callback = null;
        let changes = null;
        let conditions = {};
        Array.prototype.slice.call(args, 0).reverse().forEach((arg) => {
            if (typeof arg == "function")
                callback = arg;
            else if (typeof arg == "object") {
                if (!changes)
                    changes = arg;
                else
                    conditions = arg;
            }
        });
        return Bluebird.resolve().then(() => {
            conditions = this._model.helpers.cloneConditions(conditions);
            _.merge(conditions, { _id: this._modified._id });
            if (!changes) {
                let validation = this._model.helpers.validate(this._modified);
                if (validation.failed)
                    return Bluebird.reject(validation.error).bind(this).nodeify(callback);
                let original = this._model.helpers.cloneDocument(this._original);
                let modified = this._model.helpers.cloneDocument(this._modified);
                modified = this._model.helpers.transformToDB(modified, { document: true });
                changes = this._model.helpers.diff(original, modified);
            }
            if (!_.keys(changes).length)
                return null;
            return changes;
        }).then((changes) => {
            if (!changes && !this._isNew)
                return changes;
            return this._model.handlers.savingDocument(this, changes).then(() => changes);
        }).then((changes) => {
            if (!changes && !this._isNew)
                return false;
            if (this._isNew) {
                return new Bluebird((resolve, reject) => {
                    this._model.collection.insertOne(this._modified, { w: "majority" }, (err, doc) => {
                        if (err)
                            return reject(err);
                        return resolve(!!doc);
                    });
                });
            }
            else {
                return new Bluebird((resolve, reject) => {
                    this._model.collection.updateOne(conditions, changes, { w: "majority" }, (err, changed) => {
                        if (err) {
                            err["conditions"] = conditions;
                            err["changes"] = changes;
                            return reject(err);
                        }
                        return resolve(!!changed.modifiedCount);
                    });
                });
            }
        }).catch(err => {
            err["original"] = this._original;
            err["modified"] = this._modified;
            return Bluebird.reject(err);
        }).then((changed) => {
            conditions = { _id: this._modified._id };
            if (!changed)
                return this._modified;
            return new Bluebird((resolve, reject) => {
                this._model.collection.find(conditions).limit(1).next((err, latest) => {
                    if (err)
                        return reject(err);
                    return resolve(latest);
                });
            });
        }).then((latest) => {
            if (!latest) {
                this._isNew = true;
                this._original = this._model.helpers.cloneDocument(this._modified);
                return Bluebird.resolve(this);
            }
            return this._model.handlers.documentReceived(conditions, latest, (value) => {
                this._isPartial = false;
                this._isNew = false;
                this._modified = value;
                this._original = this._model.helpers.cloneDocument(value);
                return this;
            });
        }).nodeify(callback);
    }
    /**
     * Updates this instance to match the latest document available in the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the update completes
     * @returns {Promise<TInstance>}
     */
    update(callback) {
        return this.refresh(callback);
    }
    /**
     * Updates this instance to match the latest document available in the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the update completes
     * @returns {Promise<TInstance>}
     */
    refresh(callback) {
        let conditions = { _id: this._original._id };
        return Bluebird.resolve().then(() => {
            return new Bluebird((resolve, reject) => {
                this._model.collection.find(conditions).limit(1).next((err, doc) => {
                    if (err)
                        return reject(err);
                    return resolve(doc);
                });
            });
        }).then((newDocument) => {
            if (!newDocument) {
                this._isPartial = true;
                this._isNew = true;
                this._original = this._model.helpers.cloneDocument(this._modified);
                return this;
            }
            return this._model.handlers.documentReceived(conditions, newDocument, (doc) => {
                this._isNew = false;
                this._isPartial = false;
                this._original = doc;
                this._modified = this._model.helpers.cloneDocument(doc);
                return this;
            });
        }).nodeify(callback);
    }
    /**
     * Removes this instance's document from the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    delete(callback) {
        return this.remove(callback);
    }
    /**
     * Removes this instance's document from the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    remove(callback) {
        let conditions = { _id: this._original._id };
        return Bluebird.resolve().then(() => {
            if (this._isNew)
                return 0;
            return new Bluebird((resolve, reject) => {
                this._model.collection.deleteOne(conditions, { w: "majority" }, (err, removed) => {
                    if (err)
                        return reject(err);
                    return resolve(removed);
                });
            });
        }).then((removed) => {
            if (removed)
                return this._model.cache.clear(conditions);
            return false;
        }).then(() => {
            this._isNew = true;
            return this;
        }).nodeify(callback);
    }
    first(collection, predicate) {
        let result = null;
        _.each(collection, (value, key) => {
            if (predicate.call(this, value, key)) {
                result = value;
                return false;
            }
        });
        return result;
    }
    select(collection, predicate) {
        let isArray = Array.isArray(collection);
        let results = isArray ? [] : {};
        _.each(collection, (value, key) => {
            if (predicate.call(this, value, key)) {
                if (isArray)
                    results.push(value);
                else
                    results[key] = value;
            }
        });
        return results;
    }
    /**
     * Gets the JSON representation of this instance
     * @returns {TDocument}
     */
    toJSON() {
        return this.document;
    }
    /**
     * Gets a string representation of this instance
     * @returns {String}
     */
    toString() {
        return JSON.stringify(this.document, null, 2);
    }
}
/**
 * The schema used to validate documents of this type before being stored in the database.
 */
Instance.schema = {
    _id: false
};
/**
 * Additional which should be made available for use in the schema definition for this instance.
 */
Instance.validators = Validators_1.DefaultValidators();
/**
 * The transformations which should be applied to properties of documents of this type.
 */
Instance.transforms = {};
/**
 * The indexes which should be managed by Iridium for the collection used by this type.
 */
Instance.indexes = [];
exports.Instance = Instance;

//# sourceMappingURL=Instance.js.map
