/// <reference path="../_references.d.ts" />
import model = require('./Model');
import Promise = require('bluebird');
import general = require('./General');
declare class Instance<TDocument, TInstance> {
    /**
     * Creates a new instance which represents the given document as a type of model
     * @param {model.Model} model The model that the document represents
     * @param {TSchema} document The document which should be wrapped by this instance
     * @param {Boolean} isNew Whether the document is new (doesn't exist in the database) or not
     * @param {Boolean} isPartial Whether the document has only a subset of its fields populated
     * @description
     * This class will be subclassed automatically by Iridium to create a model specific instance
     * which takes advantage of some of v8's optimizations to boost performance significantly.
     * The instance returned by the model, and all of this instance's methods, will be of type
     * TInstance - which should represent the merger of TSchema and IInstance for best results.
     */
    constructor(model: model.Model<TDocument, TInstance>, document: TDocument, isNew?: boolean, isPartial?: boolean);
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
     * Saves any changes to this instance, using the built in diff algorithm to write the update query.
     * @param {function(Error, IInstance)} callback A callback which is triggered when the save operation completes
     * @returns {Promise<TInstance>}
     */
    save(callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Saves the given changes to this instance and updates the instance to match the latest database document.
     * @param {Object} changes The MongoDB changes object to be used when updating this instance
     * @param {function(Error, IInstance)} callback A callback which is triggered when the save operation completes
     * @returns {Promise<TInstance>}
     */
    save(changes: Object, callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Saves the given changes to this instance and updates the instance to match the latest database document.
     * @param {Object} conditions The conditions under which the update will take place - these will be merged with an _id query
     * @param {Object} changes The MongoDB changes object to be used when updating this instance
     * @param {function(Error, IInstance)} callback A callback which is triggered when the save operation completes
     * @returns {Promise<TInstance>}
     */
    save(conditions: Object, changes: Object, callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Updates this instance to match the latest document available in the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the update completes
     * @returns {Promise<TInstance>}
     */
    update(callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Updates this instance to match the latest document available in the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the update completes
     * @returns {Promise<TInstance>}
     */
    refresh(callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Removes this instance's document from the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    delete(callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Removes this instance's document from the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    remove(callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves the first element in an enumerable collection which matches the predicate
     * @param {any[]} collection The collection from which to retrieve the element
     * @param {function(any, Number): Boolean} predicate The function which determines whether to select an element
     * @returns {any}
     */
    first<T>(collection: T[], predicate: general.Predicate<T>): T;
    /**
     * Retrieves the first element in an enumerable collection which matches the predicate
     * @param {Object} collection The collection from which to retrieve the element
     * @param {function(any, String): Boolean} predicate The function which determines whether to select an element
     * @returns {any}
     */
    first<T>(collection: {
        [key: string]: T;
    }, predicate: general.Predicate<T>): T;
    /**
     * Retrieves a number of elements from an enumerable collection which match the predicate
     * @param {any[]} collection The collection from which elements will be plucked
     * @param {function(any, Number): Boolean} predicate The function which determines the elements to be plucked
     * @returns {any[]}
     */
    select<T>(collection: T[], predicate: general.Predicate<T>): T[];
    /**
     * Retrieves a number of elements from an enumerable collection which match the predicate
     * @param {Object} collection The collection from which elements will be plucked
     * @param {function(any, String): Boolean} predicate The function which determines the elements to be plucked
     * @returns {Object}
     */
    select<T>(collection: {
        [key: string]: T;
    }, predicate: general.Predicate<T>): {
        [key: string]: T;
    };
    /**
     * Gets the JSON representation of this instance
     * @returns {TDocument}
     */
    toJSON(): TDocument;
    /**
     * Gets a string representation of this instance
     * @returns {String}
     */
    toString(): string;
}
export = Instance;
