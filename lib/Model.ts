import * as  MongoDB from "mongodb";
import * as util from "util";
import * as  _ from "lodash";
import * as Skmatc from "skmatc";

import {Core} from "./Core";
import {Instance} from "./Instance";
import {Schema} from "./Schema";
import {Hooks} from "./Hooks";
import {Plugin} from "./Plugins";
import {Cache} from "./Cache";
import {CacheDirector} from "./CacheDirector";
import {CacheOnID} from "./cacheControllers/IDDirector";
import * as General from "./General";
import {Cursor} from "./Cursor";
import * as Index from "./Index";
import * as ModelOptions from "./ModelOptions";
import {Conditions} from "./Conditions";
import {Changes} from "./Changes";

import {Omnom} from "./utils/Omnom";
import {Nodeify, Map} from "./utils/Promise";
import {ModelCache} from "./ModelCache";
import {ModelHelpers} from "./ModelHelpers";
import {ModelHandlers} from "./ModelHandlers";
import * as ModelInterfaces from "./ModelInterfaces";
import {ModelSpecificInstance} from "./ModelSpecificInstance";
import {InstanceImplementation} from "./InstanceInterface";
import {Transforms, DefaultTransforms, RenameMap} from "./Transforms";
import * as AggregationPipeline from "./Aggregate";
import {MapFunction, ReduceFunction, MapReducedDocument, MapReduceFunctions, MapReduceOptions} from "./MapReduce";

export type InsertionDocument<TDocument> = TDocument | { toDB(): TDocument };

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
export class Model<TDocument, TInstance> {
    /**
     * Creates a new Iridium model representing a given ISchema and backed by a collection whose name is specified
     * @param core The Iridium core that this model should use for database access
     * @param instanceType The class which will be instantiated for each document retrieved from the database
     * @constructor
     */
    constructor(core: Core, instanceType: InstanceImplementation<TDocument, TInstance>) {
        if (!(core instanceof Core)) throw new Error("You failed to provide a valid Iridium core for this model");
        if (typeof instanceType !== "function") throw new Error("You failed to provide a valid instance constructor for this model");
        if (typeof instanceType.collection !== "string" || !instanceType.collection) throw new Error("You failed to provide a valid collection name for this model");
        if (!_.isPlainObject(instanceType.schema) || instanceType.schema._id === undefined) throw new Error("You failed to provide a valid schema for this model");

        this._core = core;

        this.loadExternal(instanceType);
        this.onNewModel();
        this.loadInternal();
    }

    /**
     * Loads any externally available properties (generally accessed using public getters/setters).
     */
    private loadExternal(instanceType: InstanceImplementation<TDocument, TInstance>) {
        this._collection = instanceType.collection;
        this._schema = instanceType.schema;
        this._hooks = instanceType;
        this._cacheDirector = instanceType.cache || new CacheOnID();
        this._transforms = instanceType.transforms || {};
        this._renames = instanceType.renames || {};
        this._indexes = instanceType.indexes || [];

        // The order of assigning _validators is deliberate. It is desired to put plugin validators
        // first so that the instance validators go second which means when these are looped through
        // and registered to skmatc, then the instance validators have a chance to overwrite the
        // validators defined by the plugins.
        this._validators = _.flatMap(this.core.plugins, (plugin) => plugin.validate || [])
                            .concat(instanceType.validators || []);

        if(!this._schema._id) this._schema._id = MongoDB.ObjectID;

        if(this._schema._id === MongoDB.ObjectID && !this._transforms._id)
            this._transforms._id = DefaultTransforms.ObjectID;

        if ((<Function>instanceType).prototype instanceof Instance)
            this._Instance = ModelSpecificInstance(this, instanceType);
        else
            this._Instance = instanceType.bind(undefined, this);
    }

    /**
     * Loads any internally (protected/private) properties and helpers only used within Iridium itself.
     */
    private loadInternal() {
        this._cache = new ModelCache(this);
        this._helpers = new ModelHelpers(this);
        this._handlers = new ModelHandlers(this);
    }

    /**
     * Process any callbacks and plugin delegation for the creation of this model.
     * It will generally be called whenever a new Iridium Core is created, however is
     * more specifically tied to the lifespan of the models themselves.
     */
    private onNewModel() {
        this._core.plugins.forEach(plugin => plugin.newModel && plugin.newModel(this));
    }

    private _helpers: ModelHelpers<TDocument, TInstance>;
    /**
     * Provides helper methods used by Iridium for common tasks
     * @returns A set of helper methods which are used within Iridium for common tasks
     */
    get helpers(): ModelHelpers<TDocument, TInstance> {
        return this._helpers;
    }

    private _handlers: ModelHandlers<TDocument, TInstance>;
    /**
     * Provides helper methods used by Iridium for hook delegation and common processes
     * @returns A set of helper methods which perform common event and response handling tasks within Iridium.
     */
    get handlers(): ModelHandlers<TDocument, TInstance> {
        return this._handlers;
    }

    private _hooks: Hooks<TDocument, TInstance> = {};

    /**
     * Gets the even hooks subscribed on this model for a number of different state changes.
     * These hooks are primarily intended to allow lifecycle manipulation logic to be added
     * in the user's model definition, allowing tasks such as the setting of default values
     * or automatic client-side joins to take place.
     */
    get hooks(): Hooks<TDocument, TInstance> {
        return this._hooks;
    }

    private _schema: Schema;
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
    get schema(): Schema {
        return this._schema;
    }

    private _core: Core;
    /**
     * Gets the Iridium core that this model is associated with.
     * @public
     * @returns The Iridium core that this model is bound to
     */
    get core(): Core {
        return this._core;
    }

    private _collection: string;
    /**
     * Gets the underlying MongoDB collection from which this model's documents are retrieved.
     * You can make use of this object if you require any low level access to the MongoDB collection,
     * however we recommend you make use of the Iridium methods whereever possible, as we cannot
     * guarantee the accuracy of the type definitions for the underlying MongoDB driver.
     * @public
     * @returns {Collection}
     */
    get collection(): MongoDB.Collection {
        return this.core.db.collection(this._collection);
    }

    /**
     * Gets the name of the underlying MongoDB collection from which this model's documents are retrieved
     * @public
     */
    get collectionName(): string {
        return this._collection;
    }

    /**
     * Sets the name of the underlying MongoDB collection from which this model's documents are retrieved
     * @public
     */
    set collectionName(value: string) {
        this._collection = value;
    }

    private _cacheDirector: CacheDirector;
    /**
     * Gets the cache controller which dictates which queries will be cached, and under which key
     * @public
     * @returns {CacheDirector}
     */
    get cacheDirector(): CacheDirector {
        return this._cacheDirector;
    }

    private _cache: ModelCache;
    /**
     * Gets the cache responsible for storing objects for quick retrieval under certain conditions
     * @public
     * @returns {ModelCache}
     */
    get cache(): ModelCache {
        return this._cache;
    }

    private _Instance: ModelInterfaces.ModelSpecificInstanceConstructor<TDocument, TInstance>;

    /**
     * Gets the constructor responsible for creating instances for this model
     */
    get Instance(): ModelInterfaces.ModelSpecificInstanceConstructor<TDocument, TInstance> {
        return this._Instance;
    }

    private _transforms: Transforms;

    /**
     * Gets the transforms which are applied whenever a document is received from the database, or
     * prior to storing a document in the database. Tasks such as converting an ObjectID to a string
     * and vice versa are all listed in this object.
     */
    get transforms() {
        return this._transforms;
    }

    private _renames: RenameMap;

    /**
     * Gets the renamed fields for this model, which will result in the field names
     * used in your code being different to those used in the database.
     */
    get renames() {
        return this._renames;
    }

    private _validators: Skmatc.Validator[];

    /**
     * Gets the custom validation types available for this model including validators from all of
     * the plugins registered with the Core that was used to instantiate this Model.
     */
    get validators() {
        return this._validators;
    }

    private _indexes: (Index.Index | Index.IndexSpecification)[];

    /**
     * Gets the indexes which Iridium will manage on this model's database collection.
     */
    get indexes() {
        return this._indexes;
    }

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
    find(conditions: { _id?: string; } | Conditions<TDocument> | string): Cursor<TDocument, TInstance>;
    /**
     * Returns all documents in the collection which match the conditions
     * @param {Object} conditions The MongoDB query dictating which documents to return
     * @param {Object} fields The fields to include or exclude from the document
     * @returns {Promise<TInstance[]>}
     */
    find(conditions: { _id?: string; } | Conditions<TDocument> | string, fields: { [name: string]: number }): Cursor<TDocument, TInstance>;
    find(conditions?: { _id?: string; } | Conditions<TDocument> | string, fields?: any): Cursor<TDocument, TInstance> {
        conditions = conditions || {};

        if (!_.isPlainObject(conditions)) conditions = { _id: conditions };
        conditions = this._helpers.convertToDB(conditions, { document: true, properties: true, renames: true });

        let cursor = this.collection.find<TDocument>(<Conditions<TDocument>>conditions);

        if(fields)
            cursor = cursor.project(fields);

        return new Cursor<TDocument, TInstance>(this, conditions, cursor);
    }

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
    get(conditions: { _id?: string; } | Conditions<TDocument>, callback?: General.Callback<TInstance>): Promise<TInstance>;
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
    get(conditions: { _id?: string; } | Conditions<TDocument>, options: ModelOptions.QueryOptions, callback?: General.Callback<TInstance>): Promise<TInstance>;
    get(...args: any[]): Promise<TInstance> {
        return this.findOne.apply(this, args);
    }

    /**
     * Retrieves a single document from the collection and wraps it as an instance
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(callback?: General.Callback<TInstance>): Promise<TInstance|null>;
    /**
     * Retrieves a single document from the collection with the given ID and wraps it as an instance
     * @param {any} id The document's unique _id field value in downstream format
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(id: string, callback?: General.Callback<TInstance>): Promise<TInstance|null>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(conditions: { _id?: string; } | Conditions<TDocument>, callback?: General.Callback<TInstance>): Promise<TInstance|null>;
    /**
     * Retrieves a single document from the collection with the given ID and wraps it as an instance
     * @param {any} id The document's unique _id field value in downstream format
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(id: string, options: ModelOptions.QueryOptions, callback?: General.Callback<TInstance>): Promise<TInstance|null>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(conditions: { _id?: string; } | Conditions<TDocument>, options: ModelOptions.QueryOptions, callback?: General.Callback<TInstance>): Promise<TInstance|null>;
    findOne(...args: any[]): Promise<TInstance|null> {
        let conditions: { _id?: any, [key: string]: any }|undefined;
        let options: ModelOptions.QueryOptions|undefined;
        let callback: General.Callback<TInstance>|undefined;

        for (let argI = 0; argI < args.length; argI++) {
            if (typeof args[argI] === "function") callback = callback || args[argI];
            else if (_.isPlainObject(args[argI])) {
                if (conditions) options = args[argI];
                else conditions = args[argI];
            }
            else conditions = { _id: args[argI] };
        }

        conditions = conditions || {};
        options = options || {};

        _.defaults(options, {
            cache: true
        });

        return Nodeify(Promise.resolve().then(() => {
            conditions = this._helpers.convertToDB(conditions, { document: false, properties: true, renames: true });

            return this._cache.get<TDocument>(conditions);
        }).then((cachedDocument: TDocument) => {
            if (cachedDocument) return cachedDocument;
            return new Promise<TDocument|null>((resolve, reject) => {
                let cursor = this.collection.find<TDocument>(conditions);

                if(options!.sort)
                    cursor = cursor.sort(options!.sort!);

                if(typeof options!.skip === "number")
                    cursor = cursor.skip(options!.skip!);

                cursor = cursor.limit(1);

                if(options!.fields)
                    cursor = cursor.project(options!.fields!);

                return cursor.next((err, result) => {
                    if (err) return reject(err);
                    return resolve(<TDocument|null>result);
                });
            });
        }).then((document) => {
            if (!document) return Promise.resolve(null);
            return this._handlers.documentReceived(conditions, document, (document, isNew?, isPartial?) => this._helpers.wrapDocument(document, isNew, isPartial), options);
        }), callback);
    }

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
    create(...args: any[]): Promise<any> {
        return this.insert.apply(this, args);
    }

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
    insert(objs: InsertionDocument<TDocument> | InsertionDocument<TDocument>[], ...args: any[]): Promise<any> {
        let objects: TDocument[];
        let options: ModelOptions.CreateOptions = {};
        let callback: General.Callback<any>|undefined = undefined;
        if (typeof args[0] === "function") callback = args[0];
        else {
            options = args[0];
            callback = args[1];
        }

        if (Array.isArray(objs))
            objects = <TDocument[]>objs;
        else
            objects = <TDocument[]>[objs];

        options = options || {};
        _.defaults(options, <ModelOptions.CreateOptions>{
            w: "majority",
            forceServerObjectId: true
        });

        return Nodeify(Promise.resolve().then(() => {
            let queryOptions = { w: options.w, upsert: options.upsert, new: true };

            if (options.upsert) {
                let docs = this._handlers.creatingDocuments(objects);
                return Map(docs, (object: { _id: any; }) => {
                    return new Promise<any[]>((resolve, reject) => {
                        this.collection.findOneAndUpdate({ _id: object._id || { $exists: false }}, object, {
                            upsert: options.upsert,
                            returnOriginal: false
                        }, (err, result) => {
                            if (err) return reject(err);
                            return resolve(result.value);
                        });
                    });
                });
            }
            else
                return this._handlers.creatingDocuments(objects).then(objects => Promise.all(_.chunk(objects, 1000).map((objects: any[]) => {
                    return new Promise<any[]>((resolve, reject) => {
                        this.collection.insertMany(objects, queryOptions, (err, result) => {
                            if (err) return reject(err);
                            return resolve(result.ops);
                        });
                    });
                }))).then(results => _.flatten(results));
        }).then(results => Map(results, (inserted: any) => {
            return this._handlers.documentReceived(null, inserted, (document, isNew?, isPartial?) => this._helpers.wrapDocument(document, isNew, isPartial), { cache: options.cache });
        })).then((results: TInstance[]) => {
            if (Array.isArray(objs)) return results;
            return results[0];
        }), callback);
    }

    /**
     * Updates the documents in the backing collection which match the conditions using the given update instructions
     * @param {Object} conditions The conditions which determine which documents will be updated
     * @param {Object} changes The changes to make to the documents
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     */
    // @ts-ignore We implement support for leaving out `options` but providing the `callback` in our base implementation, even though this complains
    update(conditions: { _id?: any } | Conditions<TDocument> | string, changes: Changes, callback?: General.Callback<number>): Promise<number>;
    /**
     * Updates the documents in the backing collection which match the conditions using the given update instructions
     * @param {Object} conditions The conditions which determine which documents will be updated
     * @param {Object} changes The replacement document to do a full update
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     */
    update(conditions: { _id?: any } | Conditions<TDocument> | string, changes: TDocument, callback?: General.Callback<number>): Promise<number>;
    /**
     * Updates the documents in the backing collection which match the conditions using the given update instructions
     * @param {Object} conditions The conditions which determine which documents will be updated
     * @param {Object} changes The changes to make to the documents
     * @param {UpdateOptions} options The options which dictate how this function behaves
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     */
    update(conditions: { _id?: string; } | Conditions<TDocument> | string, changes: Changes, options: ModelOptions.UpdateOptions, callback?: General.Callback<number>): Promise<number>;
    /**
     * Updates the documents in the backing collection which match the conditions using the given update instructions
     * @param {Object} conditions The conditions which determine which documents will be updated
     * @param {Object} changes The replacement document to do a full update
     * @param {UpdateOptions} options The options which dictate how this function behaves
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     */
    update(conditions: Conditions<TDocument> | string, changes: TDocument, options: ModelOptions.UpdateOptions, callback?: General.Callback<number>): Promise<number>;
    update(conditions: Conditions<TDocument> | string, changes: Changes, options?: ModelOptions.UpdateOptions, callback?: General.Callback<number>): Promise<number> {
        if (typeof options === "function") {
            callback = <General.Callback<number>>options;
            options = {};
        }

        const opts = options || {};

        if (!_.isPlainObject(conditions)) conditions = <Conditions<TDocument>>{
            _id: conditions
        };

        const isReplacement = Object.keys(changes).every(key => !!key.indexOf("$"));

        _.defaults(opts, {
            w: "majority",
            multi: !isReplacement
        });

        
        return Nodeify(Promise.resolve().then(() => {
            if (opts.multi && isReplacement)
                return Promise.reject(new Error("You cannot use a replacement document and { multi: true }"));

            conditions = this._helpers.convertToDB(conditions, { document: true, properties: true, renames: true });
            
            return new Promise<number>((resolve, reject) => {
                const callback = (err: Error, response: MongoDB.UpdateWriteOpResult) => {
                    if (err) return reject(err);

                    // New MongoDB 2.6+ response type
                    if (response.result && response.result.nModified !== undefined) return resolve(response.result.nModified);

                    // Legacy response type
                    return resolve(response.result.n);
                }

                if (opts.multi)
                    return this.collection.updateMany(<Conditions<TDocument>>conditions, changes, opts, callback);
                
                if (isReplacement)
                    return this.collection.replaceOne(<Conditions<TDocument>>conditions, changes, callback);

                return this.collection.updateOne(<Conditions<TDocument>>conditions, changes, opts, callback)
            })
        }), callback);
    }

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
    count(conditions: { _id?: string; } | Conditions<TDocument> | string, callback?: General.Callback<number>): Promise<number>;
    count(conds?: any, callback?: General.Callback<number>): Promise<number> {
        let conditions: { _id?: string; } | Conditions<TDocument> = conds;
        if (typeof conds === "function") {
            callback = <General.Callback<number>>conds;
            conditions = {};
        }

        conditions = conditions || {};

        if (!_.isPlainObject(conditions)) conditions = {
            _id: conditions
        };

        return Nodeify(Promise.resolve().then(() => {
            conditions = this._helpers.convertToDB(conditions, { document: true, properties: true, renames: true });

            return new Promise<number>((resolve, reject) => {
                this.collection.count(conditions, (err, results) => {
                    if (err) return reject(err);
                    return resolve(results);
                });
            });
        }), callback);
    }

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
    // @ts-ignore We implement support for leaving out `options` but providing the `callback` in our base implementation, even though this complains
    remove(conditions: { _id?: string; } | Conditions<TDocument> | any, callback?: General.Callback<number>): Promise<number>;
    /**
     * Removes all documents from the collection which match the conditions
     * @param {Object} conditions The conditions determining whether an object is removed or not
     * @param {Object} options The options controlling the way in which the function behaves
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    remove(conditions: { _id?: string; } | Conditions<TDocument> | string, options: ModelOptions.RemoveOptions, callback?: General.Callback<number>): Promise<number>;
    remove(conds?: any, options?: ModelOptions.RemoveOptions, callback?: General.Callback<number>): Promise<number> {
        let conditions: { _id?: string; } | Conditions<TDocument> = conds;

        if (typeof options === "function") {
            callback = <General.Callback<number>>options;
            options = {};
        }

        if (typeof conds === "function") {
            callback = <General.Callback<number>>conds;
            options = {};
            conditions = {};
        }

        conditions = conditions || {};
        options = options || {};

        _.defaults(options, {
            w: "majority"
        });

        if (!_.isPlainObject(conditions)) conditions = {
            _id: conditions
        };

        return Nodeify(Promise.resolve().then(() => {
            conditions = this._helpers.convertToDB(conditions, { document: true, properties: true, renames: true });

            return new Promise<number|undefined>((resolve, reject) => {
                if(options!.single) return this.collection.deleteOne(conditions, options!, (err, response) => {
                    if (err) return reject(err);
                    return resolve(response.result.n);
                });

                this.collection.deleteMany(conditions, options!, (err, response) => {
                    if (err) return reject(err);
                    return resolve(response.result.n);
                });
            });
        }).then((count) => {
            if (count === undefined) return Promise.resolve<number>(0);
            if (count === 1) this._cache.clear(conditions);
            return Promise.resolve<number>(count);
        }), callback);
    }

    /**
     * Runs an aggregate operation in MongoDB and returns the contents of the resulting aggregation
     * @param pipeline The list of aggregation pipeline stages to be executed for this aggregation
     * @return A promise which completes with the results of the aggregation task
     */
    aggregate<T>(pipeline: AggregationPipeline.Stage[], options?: AggregationPipeline.Options): Promise<T[]> {
        const cursor = this.collection.aggregate<T>(pipeline, options || {});
        return cursor.toArray();
    }

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
    mapReduce<Key, Value>(instanceType: InstanceImplementation<MapReducedDocument<Key, Value>, any>,
        options: MapReduceOptions): Promise<void>;
    mapReduce<Key, Value>(functions: InstanceImplementation<MapReducedDocument<Key, Value>, any> |
        MapReduceFunctions<TDocument, Key, Value>, options: MapReduceOptions) {
        type fn = MapReduceFunctions<TDocument, Key, Value>;
        type instance = InstanceImplementation<MapReducedDocument<Key, Value>, any>

        if ((<fn>functions).map) {
            return new Promise<MapReducedDocument<Key, Value>[]>((resolve, reject) => {
                if (options.out && options.out != "inline")
                    return reject(new Error("Expected inline mapReduce output mode for this method signature"));
                let opts = <MongoDB.MapReduceOptions>options;
                opts.out = { inline: 1 };
                this.collection.mapReduce((<fn>functions).map, (<fn>functions).reduce, opts, function (err, data) {
                    if (err) return reject(err);
                    return resolve(data);
                });
            })
        }
        else {
            let instanceType = <instance>functions;
            return new Promise<void>((resolve, reject) => {
                if (options.out && options.out == "inline")
                    return reject(new Error("Expected a non-inline mapReduce output mode for this method signature"));
                if (!instanceType.mapReduceOptions)
                    return reject(new Error("Expected mapReduceOptions to be specified on the instance type"));
                let opts = <MongoDB.MapReduceOptions>options;
                let out : {[op: string]: string} = {};
                out[(<string>options.out)] = instanceType.collection;
                opts.out = out;
                this.collection.mapReduce(instanceType.mapReduceOptions.map, instanceType.mapReduceOptions.reduce, opts, (err, data) => {
                    if (err) return reject(err);
                    return resolve();
                });
            })
        }
    }

    /**
     * Ensures that the given index is created for the collection
     * @param {Object} specification The index specification object used by MongoDB
     * @param {function(Error, String)} callback A callback which is triggered when the operation completes
     * @returns {Promise<String>} The name of the index
     */
    // @ts-ignore We implement support for leaving out `options` but providing the `callback` in our base implementation, even though this complains
    ensureIndex(specification: Index.IndexSpecification, callback?: General.Callback<string>): Promise<string>;
    /**
     * Ensures that the given index is created for the collection
     * @param {Object} specification The index specification object used by MongoDB
     * @param {MongoDB.IndexOptions} options The options dictating how the index is created and behaves
     * @param {function(Error, String)} callback A callback which is triggered when the operation completes
     * @returns {Promise<String>} The name of the index
     */
    ensureIndex(specification: Index.IndexSpecification, options: MongoDB.IndexOptions, callback?: General.Callback<string>): Promise<string>;
    ensureIndex(specification: Index.IndexSpecification, options?: MongoDB.IndexOptions, callback?: General.Callback<string>): Promise<string> {
        if (typeof options === "function") {
            callback = <General.Callback<any>>options;
            options = {};
        }

        return Nodeify(new Promise<string>((resolve, reject) => {
            this.collection.createIndex(specification, options || {}, (err: Error, name: any) => {
                if (err) return reject(err);
                return resolve(name);
            });
        }), callback);
    }

    /**
     * Ensures that all indexes defined in the model's options are created
     * @param {function(Error, String[])} callback A callback which is triggered when the operation completes
     * @returns {Promise<String[]>} The names of the indexes
     */
    ensureIndexes(callback?: General.Callback<string[]>): Promise<string[]> {
        return Nodeify(Promise.all(this._indexes.map((index: Index.Index | Index.IndexSpecification) => {
            return this.ensureIndex((<Index.Index>index).spec || <Index.IndexSpecification>index, (<Index.Index>index).options || {});
        })), callback);
    }

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
    dropIndex(specification: string | Index.IndexSpecification, callback?: General.Callback<boolean>): Promise<boolean> {
        let index: string|undefined;

        if (typeof (specification) === "string") index = <string>specification;
        else {
            index = _(<Index.IndexSpecification>specification).map((direction: number, key: string) => `${key}_${direction}`).reduce((x, y) => `${x}_${y}`);
        }

        if (!index)
            return Promise.reject(new Error("Expected a valid index name to be provided"));

        return Nodeify(new Promise<boolean>((resolve, reject) => {
            this.collection.dropIndex(index!, (err: Error, result: { ok: number }) => {
                if (err) return reject(err);
                return resolve(<any>!!result.ok);
            });
        }), callback);
    }

    /**
     * Removes all indexes (except for _id) from the collection
     * @param {function(Error, Boolean)} callback A callback which is triggered when the operation completes
     * @returns {Promise<Boolean>} Whether the indexes were dropped
     */
    dropIndexes(callback?: General.Callback<boolean>): Promise<boolean> {
        return Nodeify(new Promise<any>((resolve, reject) => {
            this.collection.dropIndexes((err, count) => {
                if (err) return reject(err);
                return resolve(count);
            });
        }), callback);
    }
}
