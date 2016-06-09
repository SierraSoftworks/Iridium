import {Core} from "./Core";
import {Model} from "./Model";
import {Plugin} from "./Plugins";
import {CacheDirector} from "./CacheDirector";
import * as General from "./General";
import * as ModelInterfaces from "./ModelInterfaces";
import * as Index from "./Index";
import {Schema} from "./Schema";
import {Transforms} from "./Transforms";
import {DefaultValidators} from "./Validators";

import * as _ from "lodash";
import * as MongoDB from "mongodb";
import * as Bluebird from "bluebird";
import * as Skmatc from "skmatc";

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
export class Instance<TDocument extends { _id?: any }, TInstance> {
    /**
     * Creates a new instance which represents the given document as a type of model
     * @param model The model that dictates the collection the document originated from as well as how validations are performed.
     * @param document The document which should be wrapped by this instance
     * @param isNew Whether the document is new (doesn't exist in the database) or not
     * @param isPartial Whether the document has only a subset of its fields populated
     *
     */
    constructor(model: Model<TDocument, TInstance>, document: TDocument, isNew: boolean = true, isPartial: boolean = false) {
        this._model = model;

        this._isNew = !!isNew;
        this._isPartial = isPartial;
        this._original = document;
        this._modified = model.helpers.cloneDocument(document);

        _.each(model.core.plugins, (plugin: Plugin) => {
            if (plugin.newInstance) plugin.newInstance(this, model);
        });
    }

    private _isNew: boolean;
    private _isPartial: boolean;
    private _model: Model<TDocument, TInstance>;
    private _original: TDocument;
    private _modified: TDocument;

    /**
     * Gets the underlying document representation of this instance
     */
    get document(): TDocument {
        return this._modified;
    }

    [name: string]: any;

    /**
     * A function which is called whenever a new document is in the process of being inserted into the database.
     * @param document The document which will be inserted into the database.
     */
    static onCreating: (document: { _id?: any }) => Promise<any> | PromiseLike<any> | void;

    /**
     * A function which is called whenever a document of this type is received from the database, prior to it being
     * wrapped by an Instance object.
     * @param document The document that was retrieved from the database.
     */
    static onRetrieved: (document: { _id?: any }) => Promise<any> | PromiseLike<any> | void;

    /**
     * A function which is called whenever a new instance has been created to wrap a document.
     * @param instance The instance which has been created.
     */
    static onReady: (instance: Instance<{ _id?: any }, Instance<{ _id?: any }, any>>) => Promise<any> | PromiseLike<any> | void;

    /**
     * A function which is called whenever an instance's save() method is called to allow you to interrogate and/or manipulate
     * the changes which are being made.
     *
     * @param instance The instance to which the changes are being made
     * @param changes The MongoDB change object describing the changes being made to the document.
     */
    static onSaving: (instance: Instance<{ _id?: any }, Instance<{ _id?: any }, any>>, changes: any) => Promise<any> | PromiseLike<any> | void;

    /**
     * The name of the collection into which documents of this type are stored.
     */
    static collection: string;

    /**
     * The schema used to validate documents of this type before being stored in the database.
     */
    static schema: Schema = {
        _id: false
    };

    /**
     * Additional which should be made available for use in the schema definition for this instance.
     */
    static validators: Skmatc.Validator[] = DefaultValidators();

    /**
     * The transformations which should be applied to properties of documents of this type.
     */
    static transforms: Transforms = {

    };

    /**
     * The cache director used to derive unique cache keys for documents of this type.
     */
    static cache: CacheDirector;

    /**
     * The indexes which should be managed by Iridium for the collection used by this type.
     */
    static indexes: (Index.Index | Index.IndexSpecification)[] = [];

    /**
     * Saves any changes to this instance, using the built in diff algorithm to write the update query.
     * @param {function(Error, IInstance)} callback A callback which is triggered when the save operation completes
     * @returns {Promise<TInstance>}
     */
    save(callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Saves the given changes to this instance and updates the instance to match the latest database document.
     * @param {Object} changes The MongoDB changes object to be used when updating this instance
     * @param {function(Error, IInstance)} callback A callback which is triggered when the save operation completes
     * @returns {Promise<TInstance>}
     */
    save(changes: Object, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Saves the given changes to this instance and updates the instance to match the latest database document.
     * @param {Object} conditions The conditions under which the update will take place - these will be merged with an _id query
     * @param {Object} changes The MongoDB changes object to be used when updating this instance
     * @param {function(Error, IInstance)} callback A callback which is triggered when the save operation completes
     * @returns {Promise<TInstance>}
     */
    save(conditions: Object, changes: Object, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    save(...args: any[]): Bluebird<TInstance> {
        let callback: General.Callback<any> = null;
        let changes: any = null;
        let conditions: any = {};

        Array.prototype.slice.call(args, 0).reverse().forEach((arg) => {
            if (typeof arg == "function") callback = arg;
            else if (typeof arg == "object") {
                if (!changes) changes = arg;
                else conditions = arg;
            }
        });

        return Bluebird.resolve().then(() => {
            conditions = this._model.helpers.cloneConditions(conditions);
            _.merge(conditions, { _id: this._modified._id });

            if (!changes) {
                let validation = this._model.helpers.validate(this._modified);
                if (validation.failed) return Bluebird.reject(validation.error).bind(this).nodeify(callback);

                let original = this._model.helpers.cloneDocument(this._original);
                let modified = this._model.helpers.cloneDocument(this._modified);
                
                modified = this._model.helpers.transformToDB(modified, { document: true }); 

                changes = this._model.helpers.diff(original, modified);
            }

            if (!_.keys(changes).length) return null;

            return changes;
        }).then((changes) => {
            if (!changes && !this._isNew) return changes;
            return this._model.handlers.savingDocument(<TInstance><any>this, changes).then(() => changes);
        }).then((changes) => {
            if (!changes && !this._isNew) return false;

            if (this._isNew) {
                return new Bluebird<boolean>((resolve, reject) => {
                    this._model.collection.insertOne(this._modified, { w: "majority" }, (err, doc) => {
                        if (err) return reject(err);
                        return resolve(<any>!!doc);
                    });
                });
            } else {
                return new Bluebird<boolean>((resolve: (changed: boolean) => void, reject) => {
                    this._model.collection.updateOne(conditions, changes, { w: "majority" }, (err, changed) => {
                        if(err) {
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
        }).then((changed: boolean) => {
            conditions = { _id: this._modified._id };
            if (!changed) return this._modified;

            return new Bluebird<TDocument>((resolve, reject) => {
                this._model.collection.find(conditions).limit(1).next((err: Error, latest) => {
                    if (err) return reject(err);
                    return resolve(latest);
                });
            });
        }).then((latest: TDocument) => {
            if(!latest) {
                this._isNew = true;
                this._original = this._model.helpers.cloneDocument(this._modified);
                return Bluebird.resolve(<TInstance><any>this);
            }

            return this._model.handlers.documentReceived(conditions, latest, (value) => {
                this._isPartial = false;
                this._isNew = false;
                this._modified = value;
                this._original = this._model.helpers.cloneDocument(value);
                return <TInstance><any>this;
            });
        }).nodeify(callback);
    }

    /**
     * Updates this instance to match the latest document available in the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the update completes
     * @returns {Promise<TInstance>}
     */
    update(callback?: General.Callback<TInstance>): Bluebird<TInstance> {
        return this.refresh(callback);
    }

    /**
     * Updates this instance to match the latest document available in the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the update completes
     * @returns {Promise<TInstance>}
     */
    refresh(callback?: General.Callback<TInstance>): Bluebird<TInstance> {
        let conditions = { _id: this._original._id };

        return Bluebird.resolve().then(() => {
            return new Bluebird<TDocument>((resolve, reject) => {
                this._model.collection.find(conditions).limit(1).next((err: Error, doc: any) => {
                    if (err) return reject(err);
                    return resolve(doc);
                });
            });
        }).then((newDocument) => {
            if (!newDocument) {
                this._isPartial = true;
                this._isNew = true;
                this._original = this._model.helpers.cloneDocument(this._modified);
                return <Bluebird<TInstance>><any>this;
            }

            return this._model.handlers.documentReceived(conditions, newDocument, (doc) => {
                this._isNew = false;
                this._isPartial = false;
                this._original = doc;
                this._modified = this._model.helpers.cloneDocument(doc);

                return <TInstance><any>this;
            });
        }).nodeify(callback);
    }

    /**
     * Removes this instance's document from the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    delete(callback?: General.Callback<TInstance>): Bluebird<TInstance> {
        return this.remove(callback);
    }

    /**
     * Removes this instance's document from the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    remove(callback?: General.Callback<TInstance>): Bluebird<TInstance> {
        let conditions = { _id: this._original._id };

        return Bluebird.resolve().then(() => {
            if (this._isNew) return 0;
            return new Bluebird<number>((resolve, reject) => {
                this._model.collection.deleteOne(conditions, { w: "majority" }, (err: Error, removed?: any) => {
                    if (err) return reject(err);
                    return resolve(removed);
                });
            });
        }).then((removed) => {
            if (removed) return this._model.cache.clear(conditions);
            return false;
        }).then(() => {
            this._isNew = true;
            return <TInstance><any>this;
        }).nodeify(callback);
    }

    /**
     * Retrieves the first element in an enumerable collection which matches the predicate
     * @param collection The collection from which to retrieve the element
     * @param predicate The function which determines whether to select an element
     * @returns The first element in the array which matched the predicate.
     */
    first<T>(collection: T[], predicate: General.Predicate<T>): T;
    /**
     * Retrieves the first element in an enumerable collection which matches the predicate
     * @param collection The collection from which to retrieve the element
     * @param predicate The function which determines whether to select an element
     * @returns The first element in the object which matched the predicate.
     */
    first<T>(collection: { [key: string]: T }, predicate: General.Predicate<T>): T;
    first<T>(collection: T[]| { [key: string]: T }, predicate: General.Predicate<T>): T {
        let result = null;

        _.each(collection, (value: T, key) => {
            if (predicate.call(this, value, key)) {
                result = value;
                return false;
            }
        });

        return result;
    }

    /**
     * Retrieves a number of elements from an enumerable collection which match the predicate
     * @param collection The collection from which elements will be plucked
     * @param predicate The function which determines the elements to be plucked
     * @returns A new array containing the elements in the array which matched the predicate.
     */
    select<T>(collection: T[], predicate: General.Predicate<T>): T[];
    /**
     * Retrieves a number of elements from an enumerable collection which match the predicate
     * @param collection The collection from which elements will be plucked
     * @param predicate The function which determines the elements to be plucked
     * @returns An object with the properties from the collection which matched the predicate.
     */
    select<T>(collection: { [key: string]: T }, predicate: General.Predicate<T>): { [key: string]: T };
    select<T>(collection: T[]| { [key: string]: T }, predicate: General.Predicate<T>): any {
        let isArray = Array.isArray(collection);
        let results: any = isArray ? [] : {};

        _.each(collection, (value: T, key) => {
            if (predicate.call(this, value, key)) {
                if (isArray) results.push(value);
                else results[key] = value;
            }
        });

        return results;
    }

    /**
     * Gets the JSON representation of this instance
     * @returns {TDocument}
     */
    toJSON(): any {
        return this.document;
    }

    /**
     * Gets a string representation of this instance
     * @returns {String}
     */
    toString(): string {
        return JSON.stringify(this.document, null, 2);
    }
}