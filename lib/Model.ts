/// <reference path="../_references.d.ts" />
import MongoDB = require('mongodb');
import Bluebird = require('bluebird');
import util = require('util');
import _ = require('lodash');

import Core from './Core';
import Instance from './Instance';
import {Schema} from './Schema';
import {Hooks} from './Hooks';
import {Plugin} from './Plugins';
import {Cache} from './Cache';
import {CacheDirector} from './CacheDirector';
import * as General from './General';
import Cursor from './Cursor';
import * as Index from './Index';
import * as ModelOptions from './ModelOptions';

import noOpCache from './caches/NoOpCache';
import memoryCache from './caches/MemoryCache';
import idCacheController from './cacheControllers/IDDirector';

import Omnom from './utils/Omnom';
import ModelCache from './ModelCache';
import ModelHelpers from './ModelHelpers';
import ModelHandlers from './ModelHandlers';
import * as ModelInterfaces from './ModelInterfaces';
import ModelSpecificInstance from './ModelSpecificInstance';

/**
 * An Iridium Model which represents a structured MongoDB collection
 * @class
 */
export default class Model<TDocument extends { _id?: any }, TInstance> implements ModelInterfaces.IModel<TDocument, TInstance> {
    /**
     * Creates a new Iridium model representing a given ISchema and backed by a collection whose name is specified
     * @param {Iridium} core The Iridium core that this model should use for database access
     * @param {String} collection The name of the collection within the database which should be used by this model
     * @param {schema} schema The schema defining the data validations to be performed on the model
     * @param {IModelOptions} options The options dictating the behaviour of the model
     * @returns {Model}
     * @constructor
     */
    constructor(core: Core, instanceType: ModelInterfaces.InstanceImplementation<TDocument, TInstance>) {
        if (!(core instanceof Core)) throw new Error("You failed to provide a valid Iridium core for this model");
        if (typeof instanceType != 'function') throw new Error("You failed to provide a valid instance constructor for this model");
        if (typeof instanceType.collection != 'string' || !instanceType.collection) throw new Error("You failed to provide a valid collection name for this model");
        if (!_.isPlainObject(instanceType.schema) || instanceType.schema._id === undefined) throw new Error("You failed to provide a valid schema for this model");
        
        this._options = instanceType;
        
        _.defaults(this._options, <ModelOptions.ModelOptions<TDocument, TInstance>>{
            identifier: {
                apply: function (value) {
                    return (value && value._bsontype == 'ObjectID') ? new MongoDB.ObjectID(value.id).toHexString() : value;
                },
                reverse: function (value) {
                    if (value === null || value === undefined) return undefined;
                    if (value && /^[a-f0-9]{24}$/.test(value)) return MongoDB.ObjectID.createFromHexString(value);
                    return value;
                }
            },
            cache: new idCacheController()
        });

        this._core = core;
        this._collection = instanceType.collection;
        this._schema = instanceType.schema;
        this._hooks = instanceType;
        this._cacheDirector = instanceType.cache;

        core.plugins.forEach((plugin: Plugin) => {
            if (plugin.newModel) plugin.newModel(this);
        });

        this._cache = new ModelCache(this);

        if ((<Function>instanceType).prototype instanceof Instance)
            this._Instance = ModelSpecificInstance(this, instanceType);
        else
            this._Instance = instanceType.bind(undefined, this);

        
        this._helpers = new ModelHelpers(this);
        this._handlers = new ModelHandlers(this);
    }

    private _options: ModelOptions.ModelOptions<TDocument, TInstance>;
    /**
     * Gets the options provided when instantiating this model
     * @public
     * @returns {ModelOptions.IModelOptions}
     * @description
     * This is intended to be consumed by plugins which require any configuration
     * options. Changes made to this object after the {plugin.newModel} hook are
     * called will not have any effect on this model.
     */
    get options(): ModelOptions.ModelOptions<TDocument, TInstance> {
        return this._options;
    }

    private _helpers: ModelHelpers<TDocument, TInstance>;
    /**
     * Provides helper methods used by Iridium for common tasks
     * @returns {ModelHelpers}
     */
    get helpers(): ModelHelpers<TDocument, TInstance> {
        return this._helpers;
    }

    private _handlers: ModelHandlers<TDocument, TInstance>;
    /**
     * Provides helper methods used by Iridium for hook delegation and common processes
     * @returns {ModelHandlers}
     */
    get handlers(): ModelHandlers<TDocument, TInstance> {
        return this._handlers;
    }
    
    private _hooks: Hooks<TDocument, TInstance> = {};
    
    /**
     * Gets the even hooks subscribed on this model for a number of different state changes
     * @returns {Hooks}
     */
    get hooks(): Hooks<TDocument, TInstance> {
        return this._hooks;
    }

    private _schema: Schema;
    /**
     * Gets the ISchema dictating the data structure represented by this model
     * @public
     * @returns {schema}
     */
    get schema(): Schema {
        return this._schema;
    }

    private _core: Core;
    /**
     * Gets the Iridium core that this model is associated with
     * @public
     * @returns {Iridium}
     */
    get core(): Core {
        return this._core;
    }

    private _collection: string;
    /**
     * Gets the underlying MongoDB collection from which this model's documents are retrieved
     * @public
     * @returns {Collection}
     */
    get collection(): MongoDB.Collection {
        if (!this.core.connection) throw new Error("Iridium Core not connected to a database.");
        return this.core.connection.collection(this._collection);
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
    find(conditions: { _id?: any, [key: string]: any } | any): Cursor<TDocument, TInstance>;
    /**
     * Returns all documents in the collection which match the conditions
     * @param {Object} conditions The MongoDB query dictating which documents to return
     * @param {Object} fields The fields to include or exclude from the document
     * @returns {Promise<TInstance[]>}
     */
    find(conditions: { _id?: any, [key: string]: any }  | any, fields: { [name: string]: number }): Cursor<TDocument, TInstance>;
    find(conditions?: { _id?: any, [key: string]: any } | any, fields?: any): Cursor<TDocument, TInstance> {
        conditions = conditions || {};
        fields = fields || {};

        if (!_.isPlainObject(conditions)) conditions = { _id: conditions };

        if (conditions.hasOwnProperty('_id'))
            conditions._id = this.options.identifier.reverse(conditions._id);

        var cursor = this.collection.find(conditions, {
            fields: fields
        });

        return new Cursor<TDocument, TInstance>(this, conditions, cursor);
    }

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
    get(conditions: { _id?: any, [key: string]: any }, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
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
    get(conditions: { _id?: any, [key: string]: any }, options: ModelOptions.QueryOptions, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    get(...args: any[]): Bluebird<TInstance> {
        return this.findOne.apply(this, args);
    }

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
    findOne(conditions: { _id?: any, [key: string]: any }, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
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
    findOne(conditions: { _id?: any, [key: string]: any }, options: ModelOptions.QueryOptions, callback?: General.Callback<TInstance>): Bluebird<TInstance>;
    findOne(...args: any[]): Bluebird<TInstance> {
        var conditions: { _id?: any, [key: string]: any } = null;
        var options: ModelOptions.QueryOptions = null;
        var callback: General.Callback<TInstance> = null;

        for (var argI = 0; argI < args.length; argI++) {
            if (typeof args[argI] == 'function') callback = callback || args[argI];
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

        return Bluebird.resolve().bind(this).then(() => {
            if (conditions.hasOwnProperty('_id'))
                conditions._id = this.options.identifier.reverse(conditions._id);

            return this._cache.get<TDocument>(conditions);
        }).then((cachedDocument: TDocument) => {
            if (cachedDocument) return cachedDocument;
            return new Bluebird<any>((resolve, reject) => {
                this.collection.findOne(conditions, <MongoDB.CollectionFindOptions>{
                    fields: options.fields,
                    skip: options.skip,
                    sort: options.sort,
                    limit: options.limit
                },(err, result) => {
                        if (err) return reject(err);
                        return resolve(result);
                    });
            });
        }).then((document: TDocument) => {
            if (!document) return null;
            return this._handlers.documentReceived(conditions, document,(document, isNew?, isPartial?) => this._helpers.wrapDocument(document, isNew, isPartial), options);
        }).nodeify(callback);
    }

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
    create(...args: any[]): Bluebird<any> {
        return this.insert.apply(this, args);
    }

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
    insert(objs: TDocument | TDocument[], ...args: any[]): Bluebird<any> {
        var objects: TDocument[];
        var options: ModelOptions.CreateOptions = {};
        var callback: General.Callback<any> = null;
        if (typeof args[0] == 'function') callback = args[0];
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
            w: 'majority',
            forceServerObjectId: true
        });

        return Bluebird.resolve().then(() => {
            var queryOptions = { w: options.w, upsert: options.upsert, new: true };

            if (options.upsert) {
                var docs = this._handlers.creatingDocuments(objects);
                return docs.map((object: { _id: any; }) => {
                    return new Bluebird<any[]>((resolve, reject) => {
                        this.collection.findAndModify({ _id: object._id }, ["_id"], object, queryOptions,(err, result) => {
                            if (err) return reject(err);
                            return resolve(result);
                        });
                    });
                });
            }
            else
                return this._handlers.creatingDocuments(objects).then(objects => _.chunk(objects, 1000)).map((objects: any[]) => {
                    return new Bluebird<any[]>((resolve, reject) => {
                        this.collection.insertMany(objects, queryOptions,(err, result) => {
                            if (err) return reject(err);
                            return resolve(result.ops);
                        });
                    });
                }).then(results => _.flatten(results));
        }).map((inserted: any) => {
            return this._handlers.documentReceived(null, inserted,(document, isNew?, isPartial?) => this._helpers.wrapDocument(document, isNew, isPartial), { cache: options.cache });
        }).then((results: TInstance[]) => {
            if (Array.isArray(objs)) return results;
            return results[0];
        }).nodeify(callback);
    }

    /**
     * Updates the documents in the backing collection which match the conditions using the given update instructions
     * @param {Object} conditions The conditions which determine which documents will be updated
     * @param {Object} changes The changes to make to the documents
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     */
    update(conditions: { _id?: any, [key: string]: any } | any, changes: any, callback?: General.Callback<number>): Bluebird<number>;
    /**
     * Updates the documents in the backing collection which match the conditions using the given update instructions
     * @param {Object} conditions The conditions which determine which documents will be updated
     * @param {Object} changes The changes to make to the documents
     * @param {UpdateOptions} options The options which dictate how this function behaves
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     */
    update(conditions: { _id?: any, [key: string]: any } | any, changes: any, options: ModelOptions.UpdateOptions, callback?: General.Callback<number>): Bluebird<number>;
    update(conditions: { _id?: any, [key: string]: any } | any, changes: any, options?: ModelOptions.UpdateOptions, callback?: General.Callback<number>): Bluebird<number> {
        if (typeof options == 'function') {
            callback = <General.Callback<number>>options;
            options = {};
        }
        
        options = options || {};

        if (!_.isPlainObject(conditions)) conditions = {
            _id: conditions
        };

        _.defaults(options, {
            w: 'majority',
            multi: true
        });

        return Bluebird.resolve().then(() => {
            if (conditions.hasOwnProperty('_id'))
                conditions._id = this.options.identifier.reverse(conditions._id);

            return new Bluebird<number>((resolve, reject) => {
                this.collection.updateMany(conditions, changes, options,(err, response) => {
                    if (err) return reject(err);

                    // New MongoDB 2.6+ response type
                    if (response.result && response.result.nModified !== undefined) return resolve(response.result.nModified);

                    // Legacy response type
                    return resolve(response.result.n);
                });
            })
        }).nodeify(callback);
    }

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
    count(conditions: { _id?: any, [key: string]: any } | any, callback?: General.Callback<number>): Bluebird<number>;
    count(conds?: any, callback?: General.Callback<number>): Bluebird<number> {
        var conditions: { _id?: any, [key: string]: any } = <{ _id?: any, [key: string]: any }>conds;
        if (typeof conds == 'function') {
            callback = <General.Callback<number>>conds;
            conditions = {};
        }

        conditions = conditions || {};

        if (!_.isPlainObject(conditions)) conditions = {
            _id: conditions
        };

        return Bluebird.resolve().then(() => {
            if (conditions.hasOwnProperty('_id'))
                conditions._id = this.options.identifier.reverse(conditions._id);

            return new Bluebird<number>((resolve, reject) => {
                this.collection.count(conditions,(err, results) => {
                    if (err) return reject(err);
                    return resolve(results);
                });
            });
        }).nodeify(callback);
    }

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
    remove(conditions: { _id?: any, [key: string]: any } | any, callback?: General.Callback<number>): Bluebird<number>;
    /**
     * Removes all documents from the collection which match the conditions
     * @param {Object} conditions The conditions determining whether an object is removed or not
     * @param {Object} options The options controlling the way in which the function behaves
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    remove(conditions: { _id?: any, [key: string]: any }, options: ModelOptions.RemoveOptions, callback?: General.Callback<number>): Bluebird<number>;
    remove(conds?: any, options?: ModelOptions.RemoveOptions, callback?: General.Callback<number>): Bluebird<number> {
        var conditions: { _id?: any, [key: string]: any } = <{ _id?: any, [key: string]: any }>conds;
        
        if (typeof options === 'function') {
            callback = <General.Callback<number>>options;
            options = {};
        }
        
        if (typeof conds == 'function') {
            callback = <General.Callback<number>>conds;
            options = {};
            conditions = {};
        }

        conditions = conditions || {};
        options = options || {};
        
        _.defaults(options, {
            w: 'majority'
        });

        if (!_.isPlainObject(conditions)) conditions = {
            _id: conditions
        };

        return Bluebird.resolve().then(() => {
            if (conditions.hasOwnProperty('_id'))
                conditions._id = this.options.identifier.reverse(conditions._id);

            return new Bluebird<number>((resolve, reject) => {
                this.collection.remove(conditions, options,(err, response) => {
                    if (err) return reject(err);
                    return resolve(response.result.n);
                });
            });
        }).then((count) => {
            if (count === 1) this._cache.clear(conditions);
            return Bluebird.resolve(count);
        }).nodeify(callback);
    }

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
    ensureIndex(specification: Index.IndexSpecification, options?: MongoDB.IndexOptions, callback?: General.Callback<string>): Bluebird<string> {
        if (typeof options == 'function') {
            callback = <General.Callback<any>>options;
            options = {};
        }

        return new Bluebird<string>((resolve, reject) => {
            this.collection.ensureIndex(specification, options,(err, name: any) => {
                if (err) return reject(err);
                return resolve(name);
            });
        }).nodeify(callback);
    }

    /**
     * Ensures that all indexes defined in the model's options are created
     * @param {function(Error, String[])} callback A callback which is triggered when the operation completes
     * @returns {Promise<String[]>} The names of the indexes
     */
    ensureIndexes(callback?: General.Callback<string[]>): Bluebird<string[]> {
        return Bluebird.resolve(this.options.indexes).map((index: Index.Index | Index.IndexSpecification) => {
            return this.ensureIndex((<Index.Index>index).spec || <Index.IndexSpecification>index,(<Index.Index>index).options || {});
        }).nodeify(callback);
    }

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
    dropIndex(specification: string | Index.IndexSpecification, callback?: General.Callback<boolean>): Bluebird<boolean> {
        var index: string;

        if (typeof (specification) === 'string') index = <string>specification;
        else {
            index = _(<Index.IndexSpecification>specification).map((direction, key) => key + '_' + direction).reduce<string>((x, y) => x + '_' + y);
        }

        return new Bluebird<boolean>((resolve, reject) => {
            this.collection.dropIndex(index,(err, result: { ok: number }) => {
                if (err) return reject(err);
                return resolve(<any>!!result.ok);
            });
        }).nodeify(callback);
    }

    /**
     * Removes all indexes (except for _id) from the collection
     * @param {function(Error, Boolean)} callback A callback which is triggered when the operation completes
     * @returns {Promise<Boolean>} Whether the indexes were dropped
     */
    dropIndexes(callback?: General.Callback<boolean>): Bluebird<boolean> {
        return new Bluebird<any>((resolve, reject) => {
            this.collection.dropAllIndexes((err, count) => {
                if (err) return reject(err);
                return resolve(count);
            });
        }).nodeify(callback);
    }
}
