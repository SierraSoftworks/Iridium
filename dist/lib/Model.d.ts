import * as MongoDB from "mongodb";
import * as Skmatc from "skmatc";
import { Core } from "./Core";
import { Schema } from "./Schema";
import { Hooks } from "./Hooks";
import { CacheDirector } from "./CacheDirector";
import * as General from "./General";
import { Cursor } from "./Cursor";
import * as Index from "./Index";
import * as ModelOptions from "./ModelOptions";
import { Conditions } from "./Conditions";
import { Changes } from "./Changes";
import { ModelCache } from "./ModelCache";
import { ModelHelpers } from "./ModelHelpers";
import { ModelHandlers } from "./ModelHandlers";
import * as ModelInterfaces from "./ModelInterfaces";
import { InstanceImplementation } from "./InstanceInterface";
import { Transforms, RenameMap } from "./Transforms";
import * as AggregationPipeline from "./Aggregate";
import { MapReducedDocument, MapReduceFunctions, MapReduceOptions } from "./MapReduce";
export declare type InsertionDocument<TDocument> = TDocument | {
    toDB(): TDocument;
};
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
export declare class Model<TDocument, TInstance> {
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
    readonly helpers: ModelHelpers<TDocument, TInstance>;
    private _handlers;
    /**
     * Provides helper methods used by Iridium for hook delegation and common processes
     * @returns A set of helper methods which perform common event and response handling tasks within Iridium.
     */
    readonly handlers: ModelHandlers<TDocument, TInstance>;
    private _hooks;
    /**
     * Gets the even hooks subscribed on this model for a number of different state changes.
     * These hooks are primarily intended to allow lifecycle manipulation logic to be added
     * in the user's model definition, allowing tasks such as the setting of default values
     * or automatic client-side joins to take place.
     */
    readonly hooks: Hooks<TDocument, TInstance>;
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
    readonly schema: Schema;
    private _core;
    /**
     * Gets the Iridium core that this model is associated with.
     * @public
     * @returns The Iridium core that this model is bound to
     */
    readonly core: Core;
    private _collection;
    /**
     * Gets the underlying MongoDB collection from which this model's documents are retrieved.
     * You can make use of this object if you require any low level access to the MongoDB collection,
     * however we recommend you make use of the Iridium methods whereever possible, as we cannot
     * guarantee the accuracy of the type definitions for the underlying MongoDB driver.
     * @public
     * @returns {Collection}
     */
    readonly collection: MongoDB.Collection;
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
    readonly cacheDirector: CacheDirector;
    private _cache;
    /**
     * Gets the cache responsible for storing objects for quick retrieval under certain conditions
     * @public
     * @returns {ModelCache}
     */
    readonly cache: ModelCache;
    private _Instance;
    /**
     * Gets the constructor responsible for creating instances for this model
     */
    readonly Instance: ModelInterfaces.ModelSpecificInstanceConstructor<TDocument, TInstance>;
    private _transforms;
    /**
     * Gets the transforms which are applied whenever a document is received from the database, or
     * prior to storing a document in the database. Tasks such as converting an ObjectID to a string
     * and vice versa are all listed in this object.
     */
    readonly transforms: Transforms;
    private _renames;
    /**
     * Gets the renamed fields for this model, which will result in the field names
     * used in your code being different to those used in the database.
     */
    readonly renames: RenameMap;
    private _validators;
    /**
     * Gets the custom validation types available for this model including validators from all of
     * the plugins registered with the Core that was used to instantiate this Model.
     */
    readonly validators: Skmatc.Validator[];
    private _indexes;
    /**
     * Gets the indexes which Iridium will manage on this model's database collection.
     */
    readonly indexes: (Index.Index | Index.IndexSpecification)[];
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
        _id?: string;
    } | Conditions<TDocument> | string): Cursor<TDocument, TInstance>;
    /**
     * Returns all documents in the collection which match the conditions
     * @param {Object} conditions The MongoDB query dictating which documents to return
     * @param {Object} fields The fields to include or exclude from the document
     * @returns {Promise<TInstance[]>}
     */
    find(conditions: {
        _id?: string;
    } | Conditions<TDocument> | string, fields: {
        [name: string]: number;
    }): Cursor<TDocument, TInstance>;
    /**
     * Retrieves a single document from the collection and wraps it as an instance
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    get(callback?: General.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves a single document from the collection with the given ID and wraps it as an instance
     * @param {any} id The document's unique _id field value in downstream format
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    get(id: string, callback?: General.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    get(conditions: {
        _id?: string;
    } | Conditions<TDocument>, callback?: General.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves a single document from the collection with the given ID and wraps it as an instance
     * @param {any} id The document's unique _id field value in downstream format
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    get(id: string, options: ModelOptions.QueryOptions, callback?: General.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    get(conditions: {
        _id?: string;
    } | Conditions<TDocument>, options: ModelOptions.QueryOptions, callback?: General.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves a single document from the collection and wraps it as an instance
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(callback?: General.Callback<TInstance>): Promise<TInstance | null>;
    /**
     * Retrieves a single document from the collection with the given ID and wraps it as an instance
     * @param {any} id The document's unique _id field value in downstream format
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(id: string, callback?: General.Callback<TInstance>): Promise<TInstance | null>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(conditions: {
        _id?: string;
    } | Conditions<TDocument>, callback?: General.Callback<TInstance>): Promise<TInstance | null>;
    /**
     * Retrieves a single document from the collection with the given ID and wraps it as an instance
     * @param {any} id The document's unique _id field value in downstream format
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(id: string, options: ModelOptions.QueryOptions, callback?: General.Callback<TInstance>): Promise<TInstance | null>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(conditions: {
        _id?: string;
    } | Conditions<TDocument>, options: ModelOptions.QueryOptions, callback?: General.Callback<TInstance>): Promise<TInstance | null>;
    /**
     * Inserts an object into the collection after validating it against this model's schema
     * @param {Object} object The object to insert into the collection
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    create(object: InsertionDocument<TDocument>, callback?: General.Callback<TInstance>): Promise<TInstance>;
    /**
     * Inserts an object into the collection after validating it against this model's schema
     * @param {Object} object The object to insert into the collection
     * @param {CreateOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    create(object: InsertionDocument<TDocument>, options: ModelOptions.CreateOptions, callback?: General.Callback<TInstance>): Promise<TInstance>;
    /**
     * Inserts the objects into the collection after validating them against this model's schema
     * @param {Object[]} objects The objects to insert into the collection
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    create(objects: InsertionDocument<TDocument>[], callback?: General.Callback<TInstance[]>): Promise<TInstance[]>;
    /**
     * Inserts the objects into the collection after validating them against this model's schema
     * @param {Object[]} objects The objects to insert into the collection
     * @param {CreateOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    create(objects: InsertionDocument<TDocument>[], options: ModelOptions.CreateOptions, callback?: General.Callback<TInstance[]>): Promise<TInstance[]>;
    /**
     * Inserts an object into the collection after validating it against this model's schema
     * @param {Object} object The object to insert into the collection
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    insert(object: InsertionDocument<TDocument>, callback?: General.Callback<TInstance>): Promise<TInstance>;
    /**
     * Inserts an object into the collection after validating it against this model's schema
     * @param {Object} object The object to insert into the collection
     * @param {CreateOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    insert(object: InsertionDocument<TDocument>, options: ModelOptions.CreateOptions, callback?: General.Callback<TInstance>): Promise<TInstance>;
    /**
     * Inserts the objects into the collection after validating them against this model's schema
     * @param {Object[]} objects The objects to insert into the collection
     * @param {function(Error, TInstance[])} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    insert(objects: InsertionDocument<TDocument>[], callback?: General.Callback<TInstance[]>): Promise<TInstance[]>;
    /**
     * Inserts the objects into the collection after validating them against this model's schema
     * @param {Object[]} objects The objects to insert into the collection
     * @param {CreateOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance[])} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    insert(objects: InsertionDocument<TDocument>[], options: ModelOptions.CreateOptions, callback?: General.Callback<TInstance[]>): Promise<TInstance[]>;
    /**
     * Updates the documents in the backing collection which match the conditions using the given update instructions
     * @param {Object} conditions The conditions which determine which documents will be updated
     * @param {Object} changes The changes to make to the documents
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     */
    update(conditions: {
        _id?: any;
    } | Conditions<TDocument> | string, changes: Changes, callback?: General.Callback<number>): Promise<number>;
    /**
     * Updates the documents in the backing collection which match the conditions using the given update instructions
     * @param {Object} conditions The conditions which determine which documents will be updated
     * @param {Object} changes The replacement document to do a full update
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     */
    update(conditions: {
        _id?: any;
    } | Conditions<TDocument> | string, changes: TDocument, callback?: General.Callback<number>): Promise<number>;
    /**
     * Updates the documents in the backing collection which match the conditions using the given update instructions
     * @param {Object} conditions The conditions which determine which documents will be updated
     * @param {Object} changes The changes to make to the documents
     * @param {UpdateOptions} options The options which dictate how this function behaves
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     */
    update(conditions: {
        _id?: string;
    } | Conditions<TDocument> | string, changes: Changes, options: ModelOptions.UpdateOptions, callback?: General.Callback<number>): Promise<number>;
    /**
     * Updates the documents in the backing collection which match the conditions using the given update instructions
     * @param {Object} conditions The conditions which determine which documents will be updated
     * @param {Object} changes The replacement document to do a full update
     * @param {UpdateOptions} options The options which dictate how this function behaves
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     */
    update(conditions: Conditions<TDocument> | string, changes: TDocument, options: ModelOptions.UpdateOptions, callback?: General.Callback<number>): Promise<number>;
    /**
     * Counts the number of documents in the collection
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    count(callback?: General.Callback<number>): Promise<number>;
    /**
     * Counts the number of documents in the collection which match the conditions provided
     * @param {Object} conditions The conditions which determine whether an object is counted or not
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    count(conditions: {
        _id?: string;
    } | Conditions<TDocument> | string, callback?: General.Callback<number>): Promise<number>;
    /**
     * Removes all documents from the collection
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    remove(callback?: General.Callback<number>): Promise<number>;
    /**
     * Removes all documents from the collection which match the conditions
     * @param {Object} conditions The conditions determining whether an object is removed or not
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    remove(conditions: {
        _id?: string;
    } | Conditions<TDocument> | any, callback?: General.Callback<number>): Promise<number>;
    /**
     * Removes all documents from the collection which match the conditions
     * @param {Object} conditions The conditions determining whether an object is removed or not
     * @param {Object} options The options controlling the way in which the function behaves
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    remove(conditions: {
        _id?: string;
    } | Conditions<TDocument> | string, options: ModelOptions.RemoveOptions, callback?: General.Callback<number>): Promise<number>;
    /**
     * Runs an aggregate operation in MongoDB and returns the contents of the resulting aggregation
     * @param pipeline The list of aggregation pipeline stages to be executed for this aggregation
     * @return A promise which completes with the results of the aggregation task
     */
    aggregate<T>(pipeline: AggregationPipeline.Stage[], options?: AggregationPipeline.Options): Promise<T[]>;
    /**
     * Runs a mapReduce operation in MongoDB and returns the contents of the resulting collection.
     * @param functions The mapReduce functions which will be passed to MongoDB to complete the operation.
     * @param options Options used to configure how MongoDB runs the mapReduce operation on your collection.
     * @return A promise which completes when the mapReduce operation has written its results to the provided collection.
     */
    mapReduce<Key, Value>(functions: MapReduceFunctions<TDocument, Key, Value>, options: MapReduceOptions): Promise<MapReducedDocument<Key, Value>[]>;
    /**
     * Runs a mapReduce operation in MongoDB and writes the results to a collection.
     * @param instanceType An Iridium.Instance type whichThe mapReduce functions which will be passed to MongoDB to complete the operation.
     * @param options Options used to configure how MongoDB runs the mapReduce operation on your collection.
     * @return A promise which completes when the mapReduce operation has written its results to the provided collection.
     */
    mapReduce<Key, Value>(instanceType: InstanceImplementation<MapReducedDocument<Key, Value>, any>, options: MapReduceOptions): Promise<void>;
    /**
     * Ensures that the given index is created for the collection
     * @param {Object} specification The index specification object used by MongoDB
     * @param {function(Error, String)} callback A callback which is triggered when the operation completes
     * @returns {Promise<String>} The name of the index
     */
    ensureIndex(specification: Index.IndexSpecification, callback?: General.Callback<string>): Promise<string>;
    /**
     * Ensures that the given index is created for the collection
     * @param {Object} specification The index specification object used by MongoDB
     * @param {MongoDB.IndexOptions} options The options dictating how the index is created and behaves
     * @param {function(Error, String)} callback A callback which is triggered when the operation completes
     * @returns {Promise<String>} The name of the index
     */
    ensureIndex(specification: Index.IndexSpecification, options: MongoDB.IndexOptions, callback?: General.Callback<string>): Promise<string>;
    /**
     * Ensures that all indexes defined in the model's options are created
     * @param {function(Error, String[])} callback A callback which is triggered when the operation completes
     * @returns {Promise<String[]>} The names of the indexes
     */
    ensureIndexes(callback?: General.Callback<string[]>): Promise<string[]>;
    /**
     * Drops the index with the specified name if it exists in the collection
     * @param {String} name The name of the index to remove
     * @param {function(Error, Boolean)} callback A callback which is triggered when the operation completes
     * @returns {Promise<Boolean>} Whether the index was dropped
     */
    dropIndex(name: string, callback?: General.Callback<boolean>): Promise<boolean>;
    /**
     * Drops the index if it exists in the collection
     * @param {IndexSpecification} index The index to remove
     * @param {function(Error, Boolean)} callback A callback which is triggered when the operation completes
     * @returns {Promise<Boolean>} Whether the index was dropped
     */
    dropIndex(index: Index.IndexSpecification, callback?: General.Callback<boolean>): Promise<boolean>;
    /**
     * Removes all indexes (except for _id) from the collection
     * @param {function(Error, Boolean)} callback A callback which is triggered when the operation completes
     * @returns {Promise<Boolean>} Whether the indexes were dropped
     */
    dropIndexes(callback?: General.Callback<boolean>): Promise<boolean>;
}
