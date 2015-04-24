/// <reference path="../_references.d.ts" />
import MongoDB = require('mongodb');
import Skmatc = require('skmatc');
import Concoction = require('concoction');
import Promise = require('bluebird');
import util = require('util');
import _ = require('lodash');

import Iridium = require('./Core');
import instance = require('./Instance');
import ISchema = require('./Schema');
import hooks = require('./Hooks');
import IPlugin = require('./Plugins');
import cache = require('./Cache');
import CacheDirector = require('./CacheDirector');
import general = require('./General');
import Cursor = require('./Cursor');
import Index = require('./Index');
import ModelOptions = require('./ModelOptions');

import noOpCache = require('./caches/NoOpCache');
import memoryCache = require('./caches/MemoryCache');
import idCacheController = require('./cacheControllers/IDDirector');

import Omnom = require('./utils/Omnom');
import ModelCache = require('./ModelCache');
import ModelHelpers = require('./ModelHelpers');
import ModelHandlers = require('./ModelHandlers');
import ModelInterfaces = require('./ModelInterfaces');
import ModelSpecificInstance = require('./ModelSpecificInstance');

export = Model;

/**
 * An Iridium Model which represents a structured MongoDB collection
 * @class
 */
class Model<TDocument, TInstance> implements ModelInterfaces.IModel<TDocument, TInstance> {
    /**
     * Creates a new Iridium model representing a given ISchema and backed by a collection whose name is specified
     * @param {Iridium} core The Iridium core that this model should use for database access
     * @param {String} collection The name of the collection within the database which should be used by this model
     * @param {schema} schema The schema defining the data validations to be performed on the model
     * @param {IModelOptions} options The options dictating the behaviour of the model
     * @returns {Model}
     * @constructor
     */
    constructor(core: Iridium, instanceType: ModelInterfaces.InstanceCreator<TDocument, TInstance> | ModelInterfaces.InstanceConstructor<TDocument, TInstance>, collection: string, schema: ISchema, options: ModelOptions.IModelOptions < TDocument, TInstance > = {}) {
        if (!(core instanceof Iridium)) throw new Error("You failed to provide a valid Iridium core for this model");
        if (typeof instanceType != 'function') throw new Error("You failed to provide a valid instance constructor for this model");
        if (typeof collection != 'string' || !collection) throw new Error("You failed to provide a valid collection name for this model");
        if (!_.isPlainObject(schema) || !_.keys(schema).length) throw new Error("You failed to provide a valid schema for this model");

        _.defaults(options, <ModelOptions.IModelOptions<TDocument, TInstance>>{
            hooks: {},
            transforms: [
                new Concoction.Rename({ _id: 'id' }),
                new Concoction.Convert({
                    id: {
                        apply: function (value) {
                            return (value && value.id) ? new MongoDB.ObjectID(value.id).toHexString() : value;
                        },
                        reverse: function (value) {
                            if (value === null || value === undefined) return undefined;
                            if (value && /^[a-f0-9]{24}$/.test(value)) return MongoDB.ObjectID.createFromHexString(value);
                            return value;
                        }
                    }
                })
            ],
            cache: new idCacheController()
        });

        this._core = core;
        this._collection = collection;
        this._schema = schema;
        this._options = options;

        core.plugins.forEach((plugin: IPlugin) => {
            if (plugin.newModel) plugin.newModel(this);
        });

        this._cacheDirector = options.cache;
        this._cache = new ModelCache(this);

        if ((<Function>instanceType).prototype instanceof instance)
            this._Instance = ModelSpecificInstance(this, <ModelInterfaces.InstanceConstructor<TDocument, TInstance>>instanceType);
        else
            this._Instance = <ModelInterfaces.ModelSpecificInstanceConstructor<TDocument, TInstance>>((<Function>instanceType).bind(undefined, this));

        this._helpers = new ModelHelpers(this);
        this._handlers = new ModelHandlers(this);
    }

    private _options: ModelOptions.IModelOptions<TDocument, TInstance>;
    /**
     * Gets the options provided when instantiating this model
     * @public
     * @returns {IModelOptions<TSchema>}
     * @description
     * This is intended to be consumed by plugins which require any configuration
     * options. Changes made to this object after the {plugin.newModel} hook are
     * called will not have any effect on this model.
     */
    get options(): ModelOptions.IModelOptions<TDocument, TInstance> {
        return this._options;
    }

    private _helpers: ModelHelpers<TDocument, TInstance>;
    /**
     * Provides helper methods used by Iridium for common tasks
     * @returns {ModelHelpers<TSchema>}
     */
    get helpers(): ModelHelpers<TDocument, TInstance> {
        return this._helpers;
    }

    private _handlers: ModelHandlers<TDocument, TInstance>;
    /**
     * Provides helper methods used by Iridium for hook delegation and common processes
     * @returns {ModelHandlers<TSchema>}
     */
    get handlers(): ModelHandlers<TDocument, TInstance> {
        return this._handlers;
    }

    private _schema: ISchema;
    /**
     * Gets the ISchema dictating the data structure represented by this model
     * @public
     * @returns {schema}
     */
    get schema(): ISchema {
        return this._schema;
    }

    private _core: Iridium;
    /**
     * Gets the Iridium core that this model is associated with
     * @public
     * @returns {Iridium}
     */
    get core(): Iridium {
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
    find(conditions: any): Cursor<TDocument, TInstance>;
    /**
     * Returns all documents in the collection which match the conditions
     * @param {Object} conditions The MongoDB query dictating which documents to return
     * @param {Object} fields The fields to include or exclude from the document
     * @returns {Promise<TInstance[]>}
     */
    find(conditions: any, fields: { [name: string]: number }): Cursor<TDocument, TInstance>;
    find(conditions?: any, fields?: any): Cursor<TDocument, TInstance> {
        conditions = conditions || {};
        fields = fields || {};

        if (fields)
            this._helpers.transform.reverse(fields);

        if (!_.isPlainObject(conditions)) conditions = this._helpers.selectOneDownstream(conditions);
        this._helpers.transform.reverse(conditions);

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
    get(callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves a single document from the collection with the given ID and wraps it as an instance
     * @param {any} id The document's unique _id field value in downstream format
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    get(id: any, callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    get(conditions: { [key: string]: any }, callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves a single document from the collection with the given ID and wraps it as an instance
     * @param {any} id The document's unique _id field value in downstream format
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    get(id: any, options: ModelOptions.QueryOptions, callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    get(conditions: { [key: string]: any }, options: ModelOptions.QueryOptions, callback?: general.Callback<TInstance>): Promise<TInstance>;
    get(...args: any[]): Promise<TInstance> {
        return this.findOne.apply(this, args);
    }

    /**
     * Retrieves a single document from the collection and wraps it as an instance
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves a single document from the collection with the given ID and wraps it as an instance
     * @param {any} id The document's unique _id field value in downstream format
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(id: any, callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(conditions: { [key: string]: any }, callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves a single document from the collection with the given ID and wraps it as an instance
     * @param {any} id The document's unique _id field value in downstream format
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(id: any, options: ModelOptions.QueryOptions, callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(conditions: { [key: string]: any }, options: ModelOptions.QueryOptions, callback?: general.Callback<TInstance>): Promise<TInstance>;
    findOne(...args: any[]): Promise<TInstance> {
        var conditions: { [key: string]: any } = null;
        var options: ModelOptions.QueryOptions = null;
        var callback: general.Callback<TInstance> = null;

        for (var argI = 0; argI < args.length; argI++) {
            if (typeof args[argI] == 'function') callback = callback || args[argI];
            else if (_.isPlainObject(args[argI])) {
                if (conditions) options = args[argI];
                else conditions = args[argI];
            }
            else conditions = this._helpers.selectOneDownstream(args[argI]);
        }

        conditions = conditions || {};
        options = options || {};

        _.defaults(options, {
            cache: true
        });

        return Promise.resolve().bind(this).then(() => {
            this._helpers.transform.reverse(conditions);

            if (options.fields)
                this._helpers.transform.reverse(options.fields);

            return this._cache.get<TDocument>(conditions);
        }).then((cachedDocument: TDocument) => {

            if (cachedDocument) return cachedDocument;
            return new Promise<any>((resolve, reject) => {
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
    create(objects: TDocument, callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Inserts an object into the collection after validating it against this model's schema
     * @param {Object} object The object to insert into the collection
     * @param {CreateOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    create(objects: TDocument, options: ModelOptions.CreateOptions, callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Inserts the objects into the collection after validating them against this model's schema
     * @param {Object[]} objects The objects to insert into the collection
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    create(objects: TDocument[], callback?: general.Callback<TInstance[]>): Promise<TInstance[]>;
    /**
     * Inserts the objects into the collection after validating them against this model's schema
     * @param {Object[]} objects The objects to insert into the collection
     * @param {CreateOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    create(objects: TDocument[], options: ModelOptions.CreateOptions, callback?: general.Callback<TInstance[]>): Promise<TInstance[]>;
    create(...args: any[]): Promise<any> {
        return this.insert.apply(this, args);
    }

    /**
     * Inserts an object into the collection after validating it against this model's schema
     * @param {Object} object The object to insert into the collection
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    insert(objects: TDocument, callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Inserts an object into the collection after validating it against this model's schema
     * @param {Object} object The object to insert into the collection
     * @param {CreateOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    insert(objects: TDocument, options: ModelOptions.CreateOptions, callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Inserts the objects into the collection after validating them against this model's schema
     * @param {Object[]} objects The objects to insert into the collection
     * @param {function(Error, TInstance[])} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    insert(objects: TDocument[], callback?: general.Callback<TInstance[]>): Promise<TInstance[]>;
    /**
     * Inserts the objects into the collection after validating them against this model's schema
     * @param {Object[]} objects The objects to insert into the collection
     * @param {CreateOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance[])} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    insert(objects: TDocument[], options: ModelOptions.CreateOptions, callback?: general.Callback<TInstance[]>): Promise<TInstance[]>;
    insert(objs: TDocument | TDocument[], ...args: any[]): Promise<any> {
        var objects: TDocument[];
        var options: ModelOptions.CreateOptions = {};
        var callback: general.Callback<any> = null;
        if (typeof args[0] == 'function') callback = args[0];
        else {
            options = args[0];
            callback = args[1];
        }

        var returnArray: boolean = false;
        if (Array.isArray(objs))
            objects = <TDocument[]>objs;
        else
            objects = <TDocument[]>[objs];

        options = options || {};
        _.defaults(options, {
            w: 1
        });

        return Promise.resolve().then(() => {
            var queryOptions = { w: options.w, upsert: options.upsert, new: true };

            if (options.upsert) {
                var docs = this._handlers.creatingDocuments(objects);
                return docs.map((object:{ _id: any; }) => {
                    return new Promise<any[]>((resolve, reject) => {
                        this.collection.findAndModify({_id: object._id}, ["_id"], object, queryOptions, (err, result) => {
                            if (err) return reject(err);
                            return resolve(result);
                        });
                    });
                });
            }
            else
                return this._handlers.creatingDocuments(objects).then((objects) => {
                    return new Promise<any[]>((resolve, reject) => {
                        this.collection.insert(objects, queryOptions,(err, results) => {
                            if (err) return reject(err);
                            return resolve(results);
                        });
                    });
                });
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
    update(conditions: any, changes: any, callback?: general.Callback<number>): Promise<number>;
    /**
     * Updates the documents in the backing collection which match the conditions using the given update instructions
     * @param {Object} conditions The conditions which determine which documents will be updated
     * @param {Object} changes The changes to make to the documents
     * @param {UpdateOptions} options The options which dictate how this function behaves
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     */
    update(conditions: any, changes: any, options: ModelOptions.UpdateOptions, callback?: general.Callback<number>): Promise<number>;
    update(conditions: any, changes: any, options?: ModelOptions.UpdateOptions, callback?: general.Callback<number>): Promise<number> {
        if (typeof options == 'function') {
            callback = <general.Callback<number>>options;
            options = {};
        }

        _.defaults(options, {
            w: 1,
            multi: true
        });

        this._helpers.transform.reverse(conditions);

        return new Promise<number>((resolve, reject) => {
            this.collection.update(conditions, changes, options,(err, changes) => {
                if (err) return reject(err);
                return resolve(changes);
            });
        }).nodeify(callback);
    }

    /**
     * Counts the number of documents in the collection
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    count(callback?: general.Callback<number>): Promise<number>;
    /**
     * Counts the number of documents in the collection which match the conditions provided
     * @param {Object} conditions The conditions which determine whether an object is counted or not
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    count(conditions: any, callback?: general.Callback<number>): Promise<number>;
    count(conditions?: any, callback?: general.Callback<number>): Promise<number> {
        if (typeof conditions == 'function') {
            callback = <general.Callback<number>>conditions;
            conditions = {};
        }
        
        return new Promise<number>((resolve, reject) => {
            this.collection.count(conditions,(err, results) => {
                if (err) return reject(err);
                return resolve(results);
            });
        }).nodeify(callback);
    }

    /**
     * Removes all documents from the collection
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    remove(callback?: general.Callback<number>): Promise<number>;
    /**
     * Removes all documents from the collection which match the conditions
     * @param {Object} conditions The conditions determining whether an object is removed or not
     * @param {function(Error, Number)} callback A callback which is triggered when the operation completes
     * @returns {Promise<number>}
     */
    remove(conditions: any, callback?: general.Callback<number>): Promise<number>;
    remove(conditions?: any, callback?: general.Callback<number>): Promise<number> {
        if (typeof conditions == 'function') {
            callback = <general.Callback<number>>conditions;
            conditions = {};
        }
        conditions = conditions || {};

        return new Promise<number>((resolve, reject) => {
            this._helpers.transform.reverse(conditions);
            this.collection.remove(conditions,(err, results) => {
                if (err) return reject(err);
                return resolve(results);
            });
        }).then((count) => {
            if(count === 1)
                return this._cache.clear(conditions).then(() => count);
            return Promise.resolve(count);
        }).nodeify(callback);
    }

    /**
     * Ensures that the given index is created for the collection
     * @param {Object} specification The index specification object used by MongoDB
     * @param {function(Error, String)} callback A callback which is triggered when the operation completes
     * @returns {Promise<String>} The name of the index
     */
    ensureIndex(specification: Index.IndexSpecification, callback?: general.Callback<string>): Promise<string>;
    /**
     * Ensures that the given index is created for the collection
     * @param {Object} specification The index specification object used by MongoDB
     * @param {MongoDB.IndexOptions} options The options dictating how the index is created and behaves
     * @param {function(Error, String)} callback A callback which is triggered when the operation completes
     * @returns {Promise<String>} The name of the index
     */
    ensureIndex(specification: Index.IndexSpecification, options: MongoDB.IndexOptions, callback?: general.Callback<string>): Promise<string>;
    ensureIndex(specification: Index.IndexSpecification, options?: MongoDB.IndexOptions, callback?: general.Callback<string>): Promise<string> {
        if (typeof options == 'function') {
            callback = <general.Callback<any>>options;
            options = {};
        }

        return new Promise<string>((resolve, reject) => {
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
    ensureIndexes(callback?: general.Callback<string[]>): Promise<string[]> {
        return Promise.resolve(this.options.indexes).map((index: Index.Index | Index.IndexSpecification) => {
            return this.ensureIndex((<Index.Index>index).spec || <Index.IndexSpecification>index,(<Index.Index>index).options || {});
        }).nodeify(callback);
    }

    /**
     * Drops the index with the specified name if it exists in the collection
     * @param {String} name The name of the index to remove
     * @param {function(Error, Boolean)} callback A callback which is triggered when the operation completes
     * @returns {Promise<Boolean>} Whether the index was dropped
     */
    dropIndex(name: string, callback?: general.Callback<boolean>): Promise<boolean>;
    /**
     * Drops the index if it exists in the collection
     * @param {IndexSpecification} index The index to remove
     * @param {function(Error, Boolean)} callback A callback which is triggered when the operation completes
     * @returns {Promise<Boolean>} Whether the index was dropped
     */
    dropIndex(index: Index.IndexSpecification, callback?: general.Callback<boolean>): Promise<boolean>;
    dropIndex(specification: string | Index.IndexSpecification, callback?: general.Callback<boolean>): Promise<boolean> {
        var index: string;

        if (typeof (specification) === 'string') index = <string>specification;
        else {
            index = _(<Index.IndexSpecification>specification).map((direction, key) => key + '_' + direction).reduce<string>((x, y) => x + '_' + y);
        }

        return new Promise<any>((resolve, reject) => {
            this.collection.dropIndex(index,(err, count) => {
                if (err) return reject(err);
                return resolve(count);
            });
        }).nodeify(callback);
    }

    /**
     * Removes all indexes (except for _id) from the collection
     * @param {function(Error, Boolean)} callback A callback which is triggered when the operation completes
     * @returns {Promise<Boolean>} Whether the indexes were dropped
     */
    dropIndexes(callback?: general.Callback<boolean>): Promise<boolean> {
        return new Promise<any>((resolve, reject) => {
            this.collection.dropAllIndexes((err, count) => {
                if (err) return reject(err);
                return resolve(count);
            });
        }).nodeify(callback);
    }
}
