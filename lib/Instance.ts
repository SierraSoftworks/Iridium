import {Core} from "./Core";
import {Model} from "./Model";
import {Plugin} from "./Plugins";
import {CacheDirector} from "./CacheDirector";
import * as General from "./General";
import * as ModelInterfaces from "./ModelInterfaces";
import * as Index from "./Index";
import {Schema} from "./Schema";
import {Transforms, RenameMap} from "./Transforms";
import {DefaultValidators} from "./Validators";
import {Conditions} from "./Conditions";
import {Changes} from "./Changes";
import * as MapReduce from "./MapReduce";
import {hasValidObjectID} from "./utils/ObjectID";
import {FieldCache} from "./InstanceInterface";
import {Nodeify} from "./utils/Promise";

import * as _ from "lodash";
import * as MongoDB from "mongodb";
import * as Skmatc from "skmatc";

/**
 * The default Iridium Instance implementation which provides methods for saving, refreshing and
 * removing the wrapped document from the collection, as well as integrating with Omnom, our
 * built in document diff processor which allows clean, atomic, document updates to be performed
 * without needing to write the update queries yourself.
 *
 * @param {any} TDocument The interface representing the structure of the documents in the collection.
 * @param {any} TInstance The type of instance which wraps the documents, generally the subclass of this class.
 *
 * This class will be subclassed automatically by Iridium to create a model specific instance
 * which takes advantage of some of v8's optimizations to boost performance significantly.
 * The instance returned by the model, and all of this instance's methods, will be of type
 * TInstance - which should represent the merger of TSchema and IInstance for best results.
 */
export class Instance<TDocument, TInstance> {
    /**
     * Creates a new instance which represents the given document as a type of model
     * @param {Model} model The model that dictates the collection the document originated from as well as how validations are performed.
     * @param {Object} document The document which should be wrapped by this instance
     * @param {Boolean} [isNew] Whether the document is new (doesn't exist in the database) or not
     * @param {Boolean} [isPartial] Whether the document has only a subset of its fields populated
     *
     */
    constructor(model: Model<TDocument, TInstance>, document: TDocument, isNew: boolean = true, isPartial: boolean = false) {
        this._model = model;

        this._isNew = !!isNew;
        this._isPartial = isPartial;
        this._original = document;
        this._modified = model.helpers.cloneDocument(document);
        this._fieldCache = {}

        _.each(model.core.plugins, (plugin: Plugin) => {
            if (plugin.newInstance) plugin.newInstance(this, model);
        });
    }

    private _isNew: boolean;
    private _isPartial: boolean;
    private _model: Model<TDocument, TInstance>;
    private _original: TDocument;
    private _modified: TDocument;
    private _fieldCache: FieldCache = {};

    /**
     * Gets the underlying document representation of this instance
     */
    get document(): TDocument {
        return this._model.helpers.applyCachedFieldChanges(<any>this);
    }

    /**
     * A function which is called whenever a new document is in the process of being inserted into the database.
     * @param {Object} document The document which will be inserted into the database.
     */
    static onCreating: (document: any) => Promise<any> | PromiseLike<any> | void;

    /**
     * A function which is called whenever a document of this type is received from the database, prior to it being
     * wrapped by an Instance object.
     * @param {Object} document The document that was retrieved from the database.
     */
    static onRetrieved: (document: any) => Promise<any> | PromiseLike<any> | void;

    /**
     * A function which is called whenever a new instance has been created to wrap a document.
     * @param {Instance} instance The instance which has been created.
     */
    static onReady: (instance: Instance<any, Instance<any, any>>) => Promise<any> | PromiseLike<any> | void;

    /**
     * A function which is called whenever an instance's save() method is called to allow you to interrogate and/or manipulate
     * the changes which are being made.
     *
     * @param {Instance} instance The instance to which the changes are being made
     * @param {Object} changes The MongoDB change object describing the changes being made to the document.
     */
    static onSaving: (instance: Instance<any, Instance<any, any>>, changes: Changes) => Promise<any> | PromiseLike<any> | void;

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
     * The rename map which will be used to map code field names to DB fields
     */
    static renames: RenameMap = {

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
     * mapReduce Options
     */
    static mapReduceOptions?: MapReduce.MapReduceFunctions<any,any,any>;

    /**
     * Saves any changes to this instance, using the built in diff algorithm to write the update query.
     * @param {function} callback A callback which is triggered when the save operation completes
     * @returns {Promise}
     */
    save(callback?: General.Callback<TInstance>): Promise<TInstance>;
    /**
     * Saves the given changes to this instance and updates the instance to match the latest database document.
     * @param {Object} changes The MongoDB changes object to be used when updating this instance
     * @param {function} callback A callback which is triggered when the save operation completes
     * @returns {Promise}
     */
    save(changes: Changes, callback?: General.Callback<TInstance>): Promise<TInstance>;
    /**
     * Saves the given changes to this instance and updates the instance to match the latest database document.
     * @param {Object} conditions The conditions under which the update will take place - these will be merged with an _id query
     * @param {Object} changes The MongoDB changes object to be used when updating this instance
     * @param {function} callback A callback which is triggered when the save operation completes
     * @returns {Promise}
     */
    save(conditions: Conditions<TDocument>, changes: Changes, callback?: General.Callback<TInstance>): Promise<TInstance>;
    save(...args: any[]): Promise<TInstance> {
        let callback: General.Callback<any>|undefined = undefined;
        let changes: any = null;
        let conditions: any = {};

        Array.prototype.slice.call(args, 0).reverse().forEach((arg: General.Callback<any>|Object) => {
            if (typeof arg == "function") callback = arg;
            else if (typeof arg == "object") {
                if (!changes) changes = arg;
                else conditions = arg;
            }
        });

        this._model.helpers.applyCachedFieldChanges(<any>this)

        return Nodeify(Promise.resolve().then(() => {
            conditions = this._model.helpers.cloneConditions(conditions);
            if (hasValidObjectID(this._modified))
                _.merge(conditions, { _id: this._modified._id });

            if (!changes) {
                let validation = this._model.helpers.validate(this._modified);
                if (validation.failed) return Nodeify(Promise.reject(validation.error), callback);

                let original = this._model.helpers.cloneDocument(this._original);
                let modified = this._model.helpers.cloneDocument(this._modified);
                
                original = this._model.helpers.transformToDB(original, { renames: true }); 
                modified = this._model.helpers.transformToDB(modified, { document: true, renames: true }); 

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
                return this._model.handlers.creatingDocuments([this._modified], { properties: false }).then((modifiedDocs) => {
                    return new Promise((resolve, reject) => {
                        this._model.collection.insertOne(modifiedDocs[0], { w: "majority" }, (err, doc) => {
                            if (err) return reject(err);
                            (<any>this._modified)._id = doc.insertedId
                            return resolve(<any>!!doc);
                        });
                    });
                });
            } else {
                return new Promise<boolean>((resolve, reject) => {
                    this._model.collection.updateOne(conditions, changes, { w: "majority" }, (err, changed) => {
                        if(err) {
                            (<Error&{conditions: Object}>err)["conditions"] = conditions;
                            (<Error&{changes: Object}>err)["changes"] = changes;
                            return reject(err);
                        }

                        return resolve(!!changed.modifiedCount);
                    });
                });
            }
        }).catch(err => {
            err["original"] = this._original;
            err["modified"] = this._modified;
            return Promise.reject(err);
        }).then<TDocument>((changed: boolean) => {
            if (!hasValidObjectID(this._modified)) return Promise.reject(new Error("Cannot save a modified document without an ID"));
            conditions = { _id: this._modified._id };
            if (!changed) return this._modified;

            return new Promise<TDocument>((resolve, reject) => {
                this._model.collection.find(conditions).limit(1).next((err: Error, latest: TDocument) => {
                    if (err) return reject(err);
                    return resolve(latest);
                });
            });
        }).then((latest: TDocument) => {
            if(!latest) {
                this._isNew = true;
                this._original = this._model.helpers.cloneDocument(this._modified);
                return Promise.resolve(<TInstance><any>this);
            }

            if (this._modified === latest) {
                this._modified = this._model.helpers.transformToDB(this._modified, { document: true, renames: true })
            }

            return this._model.handlers.documentReceived(conditions, latest, (value) => {
                this._isPartial = false;
                this._isNew = false;
                this._modified = value;
                this._fieldCache = {};
                this._original = this._model.helpers.cloneDocument(value);
                return <TInstance><any>this;
            });
        }), callback);
    }

    /**
     * Updates this instance to match the latest document available in the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the update completes
     * @returns {Promise<TInstance>}
     */
    update(callback?: General.Callback<TInstance>): Promise<TInstance> {
        return this.refresh(callback);
    }

    /**
     * Updates this instance to match the latest document available in the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the update completes
     * @returns {Promise<TInstance>}
     */
    refresh(callback?: General.Callback<TInstance>): Promise<TInstance> {
        if (!hasValidObjectID(this._original)) return Promise.reject(new Error("Cannot refresh a document without an ID"));

        let conditions = { _id: this._original._id };

        return Nodeify(Promise.resolve().then(() => {
            return new Promise<TDocument>((resolve, reject) => {
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
                return <Promise<TInstance>><any>this;
            }

            return this._model.handlers.documentReceived(conditions, newDocument, (doc) => {
                this._isNew = false;
                this._isPartial = false;
                this._original = doc;
                this._modified = this._model.helpers.cloneDocument(doc);
                this._fieldCache = {};

                return <TInstance><any>this;
            });
        }), callback);
    }

    /**
     * Removes this instance's document from the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    delete(callback?: General.Callback<TInstance>): Promise<TInstance> {
        return this.remove(callback);
    }

    /**
     * Removes this instance's document from the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    remove(callback?: General.Callback<TInstance>): Promise<TInstance> {
        if (!hasValidObjectID(this._original)) return Promise.reject(new Error("Cannot remove a document without an ID"));

        let conditions = { _id: this._original._id };

        return Nodeify(Promise.resolve().then(() => {
            if (this._isNew) return 0;
            return new Promise<number>((resolve, reject) => {
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
        }), callback);
    }

    /**
     * Retrieves the first element in an enumerable collection which matches the predicate
     * @param collection The collection from which to retrieve the element
     * @param predicate The function which determines whether to select an element
     * @returns The first element in the array which matched the predicate.
     */
    first<T>(collection: T[], predicate: General.Predicate<this, T>): T|null;
    /**
     * Retrieves the first element in an enumerable collection which matches the predicate
     * @param collection The collection from which to retrieve the element
     * @param predicate The function which determines whether to select an element
     * @returns The first element in the object which matched the predicate.
     */
    first<T>(collection: { [key: string]: T }, predicate: General.Predicate<this, T>): T|null;
    first<T>(collection: T[]| { [key: string]: T }, predicate: General.Predicate<this, T>): T|null {
        let result: T|null = null;

        _.each(collection, (value, key) => {
            if (predicate.call(this, value, key)) {
                result = <T><any>value;
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
    select<T>(collection: T[], predicate: General.Predicate<this, T>): T[];
    /**
     * Retrieves a number of elements from an enumerable collection which match the predicate
     * @param collection The collection from which elements will be plucked
     * @param predicate The function which determines the elements to be plucked
     * @returns An object with the properties from the collection which matched the predicate.
     */
    select<T>(collection: { [key: string]: T }, predicate: General.Predicate<this, T>): { [key: string]: T };
    select<T>(collection: T[]| { [key: string]: T }, predicate: General.Predicate<this, T>): any {
        let isArray = Array.isArray(collection);
        let results: any = isArray ? [] : {};

        _.each(collection, (value, key) => {
            if (predicate.call(this, value, key)) {
                if (isArray) results.push(<T><any>value);
                else results[key] = <T><any>value;
            }
        });

        return results;
    }

    protected _getField<K extends keyof TInstance, V extends TInstance[K]>(field: K): V {
        return this._model.helpers.readInstanceField(<any>this, field)
    }

    protected _setField<K extends keyof TInstance, V extends TInstance[K]>(field: K, value: V): void {
        this._model.helpers.writeInstanceField(<any>this, field, value)
    }

    /**
     * Gets the DB representation of this instance
     * @returns {TDocument}
     */
    toDB(): TDocument {
        return this._model.helpers.cloneDocument(this.document);
    }

    /**
     * Gets the JSON representation of this instance
     * @returns {TDocument}
     */
    toJSON(): any {
        return this._model.helpers.cloneDocument(this.document);
    }

    /**
     * Gets a string representation of this instance
     * @returns {String}
     */
    toString(): string {
        return JSON.stringify(this.document, null, 2);
    }
}