import { Model } from "./Model";
import { CacheDirector } from "./CacheDirector";
import * as General from "./General";
import * as Index from "./Index";
import { Schema } from "./Schema";
import { Transforms } from "./Transforms";
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
export declare class Instance<TDocument extends {
    _id?: any;
}, TInstance> {
    /**
     * Creates a new instance which represents the given document as a type of model
     * @param model The model that dictates the collection the document originated from as well as how validations are performed.
     * @param document The document which should be wrapped by this instance
     * @param isNew Whether the document is new (doesn't exist in the database) or not
     * @param isPartial Whether the document has only a subset of its fields populated
     *
     */
    constructor(model: Model<TDocument, TInstance>, document: TDocument, isNew?: boolean, isPartial?: boolean);
    private _isNew;
    private _isPartial;
    private _model;
    private _original;
    private _modified;
    /**
     * Gets the underlying document representation of this instance
     */
    document: TDocument;
    [name: string]: any;
    /**
     * A function which is called whenever a new document is in the process of being inserted into the database.
     * @param document The document which will be inserted into the database.
     */
    static onCreating: (document: {
        _id?: any;
    }) => Promise<any> | void;
    /**
     * A function which is called whenever a document of this type is received from the database, prior to it being
     * wrapped by an Instance object.
     * @param document The document that was retrieved from the database.
     */
    static onRetrieved: (document: {
        _id?: any;
    }) => Promise<any> | void;
    /**
     * A function which is called whenever a new instance has been created to wrap a document.
     * @param instance The instance which has been created.
     */
    static onReady: (instance: Instance<{
        _id?: any;
    }, Instance<{
        _id?: any;
    }, any>>) => Promise<any> | void;
    /**
     * A function which is called whenever an instance's save() method is called to allow you to interrogate and/or manipulate
     * the changes which are being made.
     *
     * @param instance The instance to which the changes are being made
     * @param changes The MongoDB change object describing the changes being made to the document.
     */
    static onSaving: (instance: Instance<{
        _id?: any;
    }, Instance<{
        _id?: any;
    }, any>>, changes: any) => Promise<any> | void;
    /**
     * The name of the collection into which documents of this type are stored.
     */
    static collection: string;
    /**
     * The schema used to validate documents of this type before being stored in the database.
     */
    static schema: Schema;
    /**
     * Additional which should be made available for use in the schema definition for this instance.
     */
    static validators: Skmatc.Validator[];
    /**
     * The transformations which should be applied to properties of documents of this type.
     */
    static transforms: Transforms;
    /**
     * The cache director used to derive unique cache keys for documents of this type.
     */
    static cache: CacheDirector;
    /**
     * The indexes which should be managed by Iridium for the collection used by this type.
     */
    static indexes: (Index.Index | Index.IndexSpecification)[];
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
    /**
     * Updates this instance to match the latest document available in the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the update completes
     * @returns {Promise<TInstance>}
     */
    update(callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Updates this instance to match the latest document available in the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the update completes
     * @returns {Promise<TInstance>}
     */
    refresh(callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Removes this instance's document from the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    delete(callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Removes this instance's document from the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    remove(callback?: General.Callback<TInstance>): Bluebird<TInstance>;
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
    first<T>(collection: {
        [key: string]: T;
    }, predicate: General.Predicate<T>): T;
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
    select<T>(collection: {
        [key: string]: T;
    }, predicate: General.Predicate<T>): {
        [key: string]: T;
    };
    /**
     * Gets the JSON representation of this instance
     * @returns {TDocument}
     */
    toJSON(): any;
    /**
     * Gets a string representation of this instance
     * @returns {String}
     */
    toString(): string;
}
