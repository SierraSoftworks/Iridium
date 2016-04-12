import * as MongoDB from "mongodb";
import * as Bluebird from "bluebird";
import * as Skmatc from "skmatc";
import { Core } from "./Core";
import { Schema } from "./Schema";
import { Hooks } from "./Hooks";
import { CacheDirector } from "./CacheDirector";
import * as General from "./General";
import { Cursor } from "./Cursor";
import * as Index from "./Index";
import * as ModelOptions from "./ModelOptions";
import { ModelCache } from "./ModelCache";
import { ModelHelpers } from "./ModelHelpers";
import { ModelHandlers } from "./ModelHandlers";
import * as ModelInterfaces from "./ModelInterfaces";
import { InstanceImplementation } from "./InstanceInterface";
import { Transforms } from "./Transforms";
import * as AggregationPipeline from "./Aggregate";
/**
 * An Iridium Model which represents a structured MongoDB collection.
 * Models expose the methods you will generally use to query those collections, and ensure that
 * the results of those queries are returned as {TInstance} instances.
 *
 * @param TDocument The interface used to determine the schema of documents in the collection.
 * @param TInstance The interface or class used to represent collection documents in the JS world.
 *
 * @class
 */
export declare class Model<TDocument extends {
    _id?: any;
}, TInstance> {
    /**
     * Creates a new Iridium model representing a given ISchema and backed by a collection whose name is specified
     * @param core The Iridium core that this model should use for database access
     * @param instanceType The class which will be instantiated for each document retrieved from the database
     * @constructor
     */
    constructor(core: Core, instanceType: InstanceImplementation<TDocument, TInstance>);
    /**
     * Loads any externally available properties (generally accessed using public getters/setters).
     */
    private loadExternal(instanceType);
    /**
     * Loads any internally (protected/private) properties and helpers only used within Iridium itself.
     */
    private loadInternal();
    /**
     * Process any callbacks and plugin delegation for the creation of this model.
     * It will generally be called whenever a new Iridium Core is created, however is
     * more specifically tied to the lifespan of the models themselves.
     */
    private onNewModel();
    private _helpers;
    /**
     * Provides helper methods used by Iridium for common tasks
     * @returns A set of helper methods which are used within Iridium for common tasks
     */
    helpers: ModelHelpers<TDocument, TInstance>;
    private _handlers;
    /**
     * Provides helper methods used by Iridium for hook delegation and common processes
     * @returns A set of helper methods which perform common event and response handling tasks within Iridium.
     */
    handlers: ModelHandlers<TDocument, TInstance>;
    private _hooks;
    /**
     * Gets the even hooks subscribed on this model for a number of different state changes.
     * These hooks are primarily intended to allow lifecycle manipulation logic to be added
     * in the user's model definition, allowing tasks such as the setting of default values
     * or automatic client-side joins to take place.
     */
    hooks: Hooks<TDocument, TInstance>;
    private _schema;
    /**
     * Gets the schema dictating the data structure represented by this model.
     * The schema is used by skmatc to validate documents before saving to the database, however
     * until MongoDB 3.1 becomes widely available (with server side validation support) we are
     * limited in our ability to validate certain types of updates. As such, these validations
     * act more as a data-integrity check than anything else, unless you purely make use of Omnom
     * updates within instances.
     * @public
     * @returns The defined validation schema for this model
     */
    schema: Schema;
    private _core;
    /**
     * Gets the Iridium core that this model is associated with.
     * @public
     * @returns The Iridium core that this model is bound to
     */
    core: Core;
    private _collection;
    /**
     * Gets the underlying MongoDB collection from which this model's documents are retrieved.
     * You can make use of this object if you require any low level access to the MongoDB collection,
     * however we recommend you make use of the Iridium methods whereever possible, as we cannot
     * guarantee the accuracy of the type definitions for the underlying MongoDB driver.
     * @public
     * @returns {Collection}
     */
    collection: MongoDB.Collection;
    /**
     * Gets the name of the underlying MongoDB collection from which this model's documents are retrieved
     * @public
     */
    /**
     * Sets the name of the underlying MongoDB collection from which this model's documents are retrieved
     * @public
     */
    collectionName: string;
    private _cacheDirector;
    /**
     * Gets the cache controller which dictates which queries will be cached, and under which key
     * @public
     * @returns {CacheDirector}
     */
    cacheDirector: CacheDirector;
    private _cache;
    /**
     * Gets the cache responsible for storing objects for quick retrieval under certain conditions
     * @public
     * @returns {ModelCache}
     */
    cache: ModelCache;
    private _Instance;
    /**
     * Gets the constructor responsible for creating instances for this model
     */
    Instance: ModelInterfaces.ModelSpecificInstanceConstructor<TDocument, TInstance>;
    private _transforms;
    /**
     * Gets the transforms which are applied whenever a document is received from the database, or
     * prior to storing a document in the database. Tasks such as converting an ObjectID to a string
     * and vice versa are all listed in this object.
     */
    transforms: Transforms;
    private _validators;
    /**
     * Gets the custom validation types available for this model. These validators are added to the
     * default skmatc validators, as well as those available through plugins, for use when checking
     * your instances.
     */
    validators: Skmatc.Validator[];
    private _indexes;
    /**
     * Gets the indexes which Iridium will manage on this model's database collection.
     */
    indexes: (Index.Index | Index.IndexSpecification)[];
    /**
     * Retrieves all documents in the collection and wraps them as instances
     * @param {function(Error, TInstance[])} callback An optional callback which will be triggered when results are available
     * @returns {Promise<TInstance[]>}
     */
    find(): Cursor<TDocument, TInstance>;
    /**
     * Returns all documents in the collection which match the conditions and wraps them as instances
     * @param {Object} conditions The MongoDB query dictating which documents to return
     * @returns {Promise<TInstance[]>}
     */
    find(conditions: {
        _id?: any;
        [key: string]: any;
    } | any): Cursor<TDocument, TInstance>;
    /**
     * Returns all documents in the collection which match the conditions
     * @param {Object} conditions The MongoDB query dictating which documents to return
     * @param {Object} fields The fields to include or exclude from the document
     * @returns {Promise<TInstance[]>}
     */
    find(conditions: {
        _id?: any;
        [key: string]: any;
    } | any, fields: {
        [name: string]: number;
    }): Cursor<TDocument, TInstance>;
    /**
     * Retrieves a single document from the collection and wraps it as an instance
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    get(callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Retrieves a single document from the collection with the given ID and wraps it as an instance
     * @param {any} id The document's unique _id field value in downstream format
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    get(id: any, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    get(conditions: {
        _id?: any;
        [key: string]: any;
    }, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Retrieves a single document from the collection with the given ID and wraps it as an instance
     * @param {any} id The document's unique _id field value in downstream format
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    get(id: any, options: ModelOptions.QueryOptions, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    get(conditions: {
        _id?: any;
        [key: string]: any;
    }, options: ModelOptions.QueryOptions, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Retrieves a single document from the collection and wraps it as an instance
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Retrieves a single document from the collection with the given ID and wraps it as an instance
     * @param {any} id The document's unique _id field value in downstream format
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(id: any, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(conditions: {
        _id?: any;
        [key: string]: any;
    }, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Retrieves a single document from the collection with the given ID and wraps it as an instance
     * @param {any} id The document's unique _id field value in downstream format
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(id: any, options: ModelOptions.QueryOptions, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(conditions: {
        _id?: any;
        [key: string]: any;
    }, options: ModelOptions.QueryOptions, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Inserts an object into the collection after validating it against this model's schema
     * @param {Object} object The object to insert into the collection
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    create(objects: TDocument, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Inserts an object into the collection after validating it against this model's schema
     * @param {Object} object The object to insert into the collection
     * @param {CreateOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    create(objects: TDocument, options: ModelOptions.CreateOptions, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Inserts the objects into the collection after validating them against this model's schema
     * @param {Object[]} objects The objects to insert into the collection
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    create(objects: TDocument[], callback?: General.Callback<TInstance[]>): Bluebird<TInstance[]>;
    /**
     * Inserts the objects into the collection after validating them against this model's schema
     * @param {Object[]} objects The objects to insert into the collection
     * @param {CreateOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    create(objects: TDocument[], options: ModelOptions.CreateOptions, callback?: General.Callback<TInstance[]>): Bluebird<TInstance[]>;
    /**
     * Inserts an object into the collection after validating it against this model's schema
     * @param {Object} object The object to insert into the collection
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    insert(objects: TDocument, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Inserts an object into the collection after validating it against this model's schema
     * @param {Object} object The object to insert into the collection
     * @param {CreateOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    insert(objects: TDocument, options: ModelOptions.CreateOptions, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    /**
     * Inserts the objects into the collection after validating them against this model's schema
     * @param {Object[]} objects The objects to insert into the collection
     * @param {function(Error, TInstance[])} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    insert(objects: TDocument[], callback?: General.Callback<TInstance[]>): Bluebird<TInstance[]>;
    /**
     * Inserts the objects into the collection after validating them against this model's schema
     * @param {Object[]} objects The objects to insert into the collection
     * @param {CreateOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance[])} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    insert(objects: TDocument[], options: ModelOptions.CreateOptions, callback?: General.Callback<TInstance[]>): Bluebird<TInstance[]>;
    /**
     * Updates the documents in the backing collection which match the conditions using the given update instructions
     * @param {Object} conditions The conditions which determine which documents will be updated
     * @param {Object} changes The changes to make to the documents
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     */
    update(conditions: {
        _id?: any;
        [key: string]: any;
    } | any, changes: any, callback?: General.Callback<number>): Bluebird<number>;
    /**
     * Updates the documents in the backing collection which match the conditions using the given update instructions
     * @param {Object} conditions The conditions which determine which documents will be updated
     * @param {Object} changes The changes to make to the documents
     * @param {UpdateOptions} options The options which dictate how this function behaves
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     */
    update(conditions: {
        _id?: any;
        [key: string]: any;
    } | any, changes: any, options: ModelOptions.UpdateOptions, callback?: General.Callback<number>): Bluebird<number>;
    /**
     * Counts the number of documents in the collection
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    count(callback?: General.Callback<number>): Bluebird<number>;
    /**
     * Counts the number of documents in the collection which match the conditions provided
     * @param {Object} conditions The conditions which determine whether an object is counted or not
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    count(conditions: {
        _id?: any;
        [key: string]: any;
    } | any, callback?: General.Callback<number>): Bluebird<number>;
    /**
     * Removes all documents from the collection
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    remove(callback?: General.Callback<number>): Bluebird<number>;
    /**
     * Removes all documents from the collection which match the conditions
     * @param {Object} conditions The conditions determining whether an object is removed or not
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    remove(conditions: {
        _id?: any;
        [key: string]: any;
    } | any, callback?: General.Callback<number>): Bluebird<number>;
    /**
     * Removes all documents from the collection which match the conditions
     * @param {Object} conditions The conditions determining whether an object is removed or not
     * @param {Object} options The options controlling the way in which the function behaves
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    remove(conditions: {
        _id?: any;
        [key: string]: any;
    }, options: ModelOptions.RemoveOptions, callback?: General.Callback<number>): Bluebird<number>;
    aggregate<T>(pipeline: AggregationPipeline.Stage[]): Bluebird<T[]>;
    /**
     * Ensures that the given index is created for the collection
     * @param {Object} specification The index specification object used by MongoDB
     * @param {function(Error, String)} callback A callback which is triggered when the operation completes
     * @returns {Promise<String>} The name of the index
     */
    ensureIndex(specification: Index.IndexSpecification, callback?: General.Callback<string>): Bluebird<string>;
    /**
     * Ensures that the given index is created for the collection
     * @param {Object} specification The index specification object used by MongoDB
     * @param {MongoDB.IndexOptions} options The options dictating how the index is created and behaves
     * @param {function(Error, String)} callback A callback which is triggered when the operation completes
     * @returns {Promise<String>} The name of the index
     */
    ensureIndex(specification: Index.IndexSpecification, options: MongoDB.IndexOptions, callback?: General.Callback<string>): Bluebird<string>;
    /**
     * Ensures that all indexes defined in the model's options are created
     * @param {function(Error, String[])} callback A callback which is triggered when the operation completes
     * @returns {Promise<String[]>} The names of the indexes
     */
    ensureIndexes(callback?: General.Callback<string[]>): Bluebird<string[]>;
    /**
     * Drops the index with the specified name if it exists in the collection
     * @param {String} name The name of the index to remove
     * @param {function(Error, Boolean)} callback A callback which is triggered when the operation completes
     * @returns {Promise<Boolean>} Whether the index was dropped
     */
    dropIndex(name: string, callback?: General.Callback<boolean>): Bluebird<boolean>;
    /**
     * Drops the index if it exists in the collection
     * @param {IndexSpecification} index The index to remove
     * @param {function(Error, Boolean)} callback A callback which is triggered when the operation completes
     * @returns {Promise<Boolean>} Whether the index was dropped
     */
    dropIndex(index: Index.IndexSpecification, callback?: General.Callback<boolean>): Bluebird<boolean>;
    /**
     * Removes all indexes (except for _id) from the collection
     * @param {function(Error, Boolean)} callback A callback which is triggered when the operation completes
     * @returns {Promise<Boolean>} Whether the indexes were dropped
     */
    dropIndexes(callback?: General.Callback<boolean>): Bluebird<boolean>;
}
