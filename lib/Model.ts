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

import noOpCache = require('./caches/NoOpCache');
import memoryCache = require('./caches/MemoryCache');
import idCacheController = require('./cacheControllers/IDDirector');

import Omnom = require('./utils/Omnom');

/**
 * An Iridium Model which represents a structured MongoDB collection
 * @class
 */
export class Model<TDocument, TInstance> implements IModel<TDocument, TInstance> {
    /**
     * Creates a new Iridium model representing a given ISchema and backed by a collection whose name is specified
     * @param {Iridium} core The Iridium core that this model should use for database access
     * @param {String} collection The name of the collection within the database which should be used by this model
     * @param {schema} schema The schema defining the data validations to be performed on the model
     * @param {IModelOptions} options The options dictating the behaviour of the model
     * @returns {Model}
     * @constructor
     */
    constructor(core: Iridium, instanceType: InstanceCreator<TDocument, TInstance> | InstanceConstructor<TDocument, TInstance>, collection: string, schema: ISchema, options: IModelOptions<TDocument, TInstance> = {}) {

        // Allow instantiation doing `require('iridium').Model(db, 'collection', {})`
        if (!(this instanceof Model)) return new Model<TDocument, TInstance>(core, instanceType, collection, schema, options);

        if (!(core instanceof Iridium)) throw new Error("You failed to provide a valid Iridium core for this model");
        if (typeof instanceType != 'function') throw new Error("You failed to provide a valid instance constructor for this model");
        if (typeof collection != 'string' || !collection) throw new Error("You failed to provide a valid collection name for this model");
        if (!_.isPlainObject(schema) || !_.keys(schema).length) throw new Error("You failed to provide a valid schema for this model");

        options = options || {};

        _.defaults(options, <IModelOptions<TDocument, TInstance>>{
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

        if (instanceType.prototype instanceof instance)
            this._Instance = ModelSpecificInstance(this, <InstanceConstructor<TDocument, TInstance>>instanceType);
        else
            this._Instance = <ModelSpecificInstanceConstructor<TDocument, TInstance>>(instanceType.bind(undefined, this));

        this._helpers = new ModelHelpers(this);
        this._handlers = new ModelHandlers(this);
    }

    private _options: IModelOptions<TDocument, TInstance>;
    /**
     * Gets the options provided when instantiating this model
     * @public
     * @returns {IModelOptions<TSchema>}
     * @description
     * This is intended to be consumed by plugins which require any configuration
     * options. Changes made to this object after the {plugin.newModel} hook are
     * called will not have any effect on this model.
     */
    get options(): IModelOptions<TDocument, TInstance> {
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

    private _Instance: ModelSpecificInstanceConstructor<TDocument, TInstance>;

    /**
     * Gets the constructor responsible for creating instances for this model
     */
    get Instance(): ModelSpecificInstanceConstructor<TDocument, TInstance> {
        return this._Instance;
    }
    
    /**
     * Retrieves all documents in the collection and wraps them as instances
     * @param {function(Error, TInstance[])} callback An optional callback which will be triggered when results are available
     * @returns {Promise<TInstance[]>}
     */
    find(callback?: general.Callback<TInstance[]>): Promise<TInstance[]>;
    /**
     * Returns all documents in the collection which match the conditions and wraps them as instances
     * @param {Object} conditions The MongoDB query dictating which documents to return
     * @param {function(Error, TInstance[])} callback An optional callback which will be triggered when results are available
     * @returns {Promise<TInstance[]>}
     */
    find(conditions: any, callback?: general.Callback<TInstance[]>): Promise<TInstance[]>;
    /**
     * Returns all documents in the collection which match the conditions
     * @param {Object} conditions The MongoDB query dictating which documents to return
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance[])} callback An optional callback which will be triggered when results are available
     * @returns {Promise<TInstance[]>}
     */
    find(conditions: any, options: QueryOptions, callback?: general.Callback<TInstance[]>): Promise<TInstance[]>;
    find(conditions?: any, options?: QueryOptions, callback?: general.Callback<TInstance[]>): Promise<TInstance[]> {
        if (typeof options == 'function') {
            callback = <general.Callback<TInstance[]>>options;
            options = {};
        }

        if (typeof conditions == 'function') {
            callback = <general.Callback<TInstance[]>>conditions;
            conditions = {};
            options = {};
        }

        conditions = conditions || {};
        options = options || {};

        _.defaults(options, <QueryOptions>{

        });

        return Promise.resolve().then(() => {
            if (options.fields)
                this.helpers.transform.reverse(options.fields);

            if (!_.isPlainObject(conditions)) conditions = this.helpers.selectOneDownstream(conditions);
            this.helpers.transform.reverse(conditions);

            var cursor = this.collection.find(conditions, {
                limit: options.limit,
                sort: options.sort,
                skip: options.skip,
                fields: options.fields
            });

            return Promise.promisify<TDocument[]>((callback) => {
                cursor.toArray(callback);
            })();
        }).then((results: TDocument[]) => {
            if (!results || !results.length) return Promise.resolve(<TInstance[]>[]);
            return this.handlers.documentsReceived(conditions, results,(document, isNew?, isPartial?) => this.helpers.wrapDocument(document, isNew, isPartial), options);
        }).nodeify(callback);
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
    get(id: any, options: QueryOptions, callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    get(conditions: { [key: string]: any }, options: QueryOptions, callback?: general.Callback<TInstance>): Promise<TInstance>;
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
    findOne(id: any, options: QueryOptions, callback?: general.Callback<TInstance>): Promise<TInstance>;
    /**
     * Retrieves a single document from the collection which matches the conditions
     * @param {Object} conditions The MongoDB query dictating which document to return
     * @param {QueryOptions} options The options dictating how this function behaves
     * @param {function(Error, TInstance)} callback An optional callback which will be triggered when a result is available
     * @returns {Promise<TInstance>}
     */
    findOne(conditions: { [key: string]: any }, options: QueryOptions, callback?: general.Callback<TInstance>): Promise<TInstance>;
    findOne(...args: any[]): Promise<TInstance> {
        var conditions: { [key: string]: any } = null;
        var options: QueryOptions = null;
        var callback: general.Callback<TInstance> = null;

        for (var argI = 0; argI < args.length; argI++) {
            if (typeof args[argI] == 'function') callback = callback || args[argI];
            else if (_.isPlainObject(args[argI])) {
                if (conditions) options = args[argI];
                else conditions = args[argI];
            }
            else conditions = this.helpers.selectOneDownstream(args[argI]);
        }

        conditions = conditions || {};
        options = options || {};

        _.defaults(options, {
            wrap: true,
            cache: true
        });

        return Promise.resolve().bind(this).then(() => {
            this.helpers.transform.reverse(conditions);

            if (options.fields)
                this.helpers.transform.reverse(options.fields);

            return this.cache.get(conditions);
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
            return this.handlers.documentsReceived(conditions, [document],(document, isNew?, isPartial?) => this.helpers.wrapDocument(document, isNew, isPartial), options).then((documents) => documents[0]);
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
    create(objects: TDocument, options: CreateOptions, callback?: general.Callback<TInstance>): Promise<TInstance>;
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
    create(objects: TDocument[], options: CreateOptions, callback?: general.Callback<TInstance[]>): Promise<TInstance[]>;
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
    insert(objects: TDocument, options: CreateOptions, callback?: general.Callback<TInstance>): Promise<TInstance>;
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
    insert(objects: TDocument[], options: CreateOptions, callback?: general.Callback<TInstance[]>): Promise<TInstance[]>;
    insert(objs: TDocument | TDocument[], ...args: any[]): Promise<any> {
        var objects: TDocument[];
        var options: CreateOptions = {};
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

            if (options.upsert)
                return this.handlers.creatingDocuments(objects).map((object: { _id: any; }) => {
                    return new Promise<any[]>((resolve, reject) => {
                        this.collection.findAndModify({ _id: object._id }, ["_id"], object, queryOptions,(err, result) => {
                            if (err) return reject(err);
                            return resolve(result);
                        });
                    });
                });
            else
                return this.handlers.creatingDocuments(objects).then((objects) => {
                    return new Promise<any[]>((resolve, reject) => {
                        this.collection.insert(objects, queryOptions,(err, results) => {
                            if (err) return reject(err);
                            return resolve(results);
                        });
                    });
                });
        }).then((inserted: any[]) => {
            return this.handlers.documentsReceived(null, inserted,(document, isNew?, isPartial?) => this.helpers.wrapDocument(document, isNew, isPartial), { cache: options.cache });
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
    update(conditions: any, changes: any, options: UpdateOptions, callback?: general.Callback<number>): Promise<number>;
    update(conditions: any, changes: any, options?: UpdateOptions, callback?: general.Callback<number>): Promise<number> {
        if (typeof options == 'function') {
            callback = <general.Callback<number>>options;
            options = {};
        }

        _.defaults(options, {
            w: 1,
            multi: true
        });

        this.helpers.transform.reverse(conditions);

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

        var $this = this;

        return new Promise<number>((resolve, reject) => {
            $this.collection.count(conditions,(err, results) => {
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
            this.collection.remove(conditions,(err, results) => {
                if (err) return reject(err);
                return resolve(results);
            });
        }).then((count) => {
            return this.cache.clear(conditions).then(() => count);
        }).nodeify(callback);
    }

    /**
     * Ensures that the given index is created for the collection
     * @param {Object} specification The index specification object used by MongoDB
     * @param {function(Error, String)} callback A callback which is triggered when the operation completes
     * @returns {Promise<String>} The name of the index
     */
    ensureIndex(specification: IndexSpecification, callback?: general.Callback<string>): Promise<string>;
    /**
     * Ensures that the given index is created for the collection
     * @param {Object} specification The index specification object used by MongoDB
     * @param {MongoDB.IndexOptions} options The options dictating how the index is created and behaves
     * @param {function(Error, String)} callback A callback which is triggered when the operation completes
     * @returns {Promise<String>} The name of the index
     */
    ensureIndex(specification: IndexSpecification, options: MongoDB.IndexOptions, callback?: general.Callback<string>): Promise<string>;
    ensureIndex(specification: IndexSpecification, options?: MongoDB.IndexOptions, callback?: general.Callback<string>): Promise<string> {
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
        return Promise.resolve(this.options.indexes).map((index: Index | IndexSpecification) => {
            return this.ensureIndex((<Index>index).spec || <IndexSpecification>index,(<Index>index).options || {});
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
    dropIndex(index: IndexSpecification, callback?: general.Callback<boolean>): Promise<boolean>;
    dropIndex(specification: string | IndexSpecification, callback?: general.Callback<boolean>): Promise<boolean> {
        var index: string;

        if (typeof (specification) === 'string') index = <string>specification;
        else {
            index = _(<IndexSpecification>specification).map((direction, key) => key + '_' + direction).reduce<string>((x, y) => x + '_' + y);
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

export interface InstanceConstructor<TDocument, TInstance> {
    new (model: Model<TDocument, TInstance>, doc: TDocument, isNew?: boolean, isPartial?: boolean): TInstance;
}

export interface InstanceCreator<TDocument, TInstance> {
    (model: Model<TDocument, TInstance>, doc: TDocument, isNew?: boolean, isPartial?: boolean): TInstance;
}

export interface ModelSpecificInstanceConstructor<TDocument, TInstance> {
    new (doc: TDocument, isNew?: boolean, isPartial?: boolean): TInstance;
}

export interface IModelBase {
    collection: MongoDB.Collection;
    collectionName: string;
    core: Iridium;
    schema: ISchema;
    cache: ModelCache;
    cacheDirector: CacheDirector;
}

export interface IModelFactory<TDocument, TInstance> {
    (core: Iridium): IModel<TDocument, TInstance>;
}

export interface IModelOptions<TDocument, TInstance> {
    hooks?: hooks.IHooks<TDocument, TInstance>;
    validators?: SkmatcCore.IValidator[];
    transforms?: Concoction.Ingredient[];
    cache?: CacheDirector;
    indexes?: (Index | IndexSpecification)[];
    properties?: { [key: string]: (general.PropertyGetter<any> | general.Property<any>) };
}

export interface IModel<TDocument, TInstance> extends IModelBase {
    Instance: new (doc: TDocument, isNew?: boolean, isPartial?: boolean) => TInstance;
}

export class ModelHelpers<TDocument, TInstance> {
    constructor(model: Model<TDocument, TInstance>) {
        this._model = model;

        this._validator = new Skmatc(model.schema);
        this._transform = new Concoction(model.options.transforms);
    }

    private _model: Model<TDocument, TInstance>;

    private _transform: concoction;

    /**
     * Gets the Concoction transforms defined for this model
     * @returns {Concoction}
     */
    get transform(): Concoction {
        return this._transform;
    }

    private _validator: Skmatc;

    /**
     * Validates a document to ensure that it matches the model's ISchema requirements
     * @param {any} document The document to validate against the ISchema
     * @returns {SkmatcCore.IResult} The result of the validation
     */
    validate(document: TDocument): SkmatcCore.IResult {
        return this._validator.validate(document);
    }

    /**
     * Creates a selector based on the document's unique _id field
     * @param {object} document The document to render the unique selector for
     * @returns {{_id: any}} A database selector which can be used to return only this document
     */
    selectOne(document: TDocument): { _id: any } {
        var testDoc: TDocument = _.cloneDeep(document);
        this.transform.reverse(testDoc);
        return {
            _id: (<any>testDoc)._id
        };
    }

    /**
     * Gets the field used in the ISchema to represent the document _id
     */
    get identifierField(): string {
        var id = new String("");
        var testDoc = {
            _id: id
        };

        this.transform.apply(testDoc);

        var idField = null;
        for (var k in testDoc)
            if (testDoc[k] === id) {
                idField = k;
                break;
            }

        return idField;
    }

    /**
     * Creates a selector based on the document's unique _id field in downstream format
     * @param {any} id The downstream identifier to use when creating the selector
     * @returns {object} A database selector which can be used to return only this document in downstream form
     */
    selectOneDownstream(id: TDocument): any {
        return _.pick(id, this.identifierField);
    }

    /**
     * Wraps the given document in an instance wrapper for use throughout the application
     * @param {any} document The document to be wrapped as an instance
     * @param {Boolean} isNew Whether the instance originated from the database or was created by the application
     * @param {Boolean} isPartial Whether the document supplied contains all information present in the database
     * @returns {any} An instance which wraps this document
     */
    wrapDocument(document: TDocument, isNew?: boolean, isPartial?: boolean): TInstance {
        return new this._model.Instance(document, isNew, isPartial);
    }

    /**
     * Performs a diff operation between two documents and creates a MongoDB changes object to represent the differences
     * @param {any} original The original document prior to changes being made
     * @param {any} modified The document after changes were made
     */
    diff(original: TDocument, modified: TDocument): any {
        var omnom = new Omnom();
        omnom.diff(original, modified);
        return omnom.changes;
    }
}

export class ModelHandlers<TDocument, TInstance> {
    constructor(model: Model<TDocument, TInstance>) {
        this._model = model;
    }

    private _model: Model<TDocument, TInstance>;
    get model(): Model<TDocument, TInstance> {
        return this._model;
    }

    documentsReceived<TResult>(conditions: any,
        results: TDocument[],
        wrapper: (document: TDocument, isNew?: boolean, isPartial?: boolean) => TResult,
        options: QueryOptions = {}): Promise<TResult[]> {
        _.defaults(options, {
            cache: true,
            partial: false
        });

        return Promise.resolve(results).map((target: any) => {
            return <Promise<TResult>>Promise.resolve().then(() => {
                // Trigger the received hook
                if (this.model.options.hooks.retrieved) return this.model.options.hooks.retrieved(target);
            }).then(() => {
                // Cache the document if caching is enabled
                if (conditions && this.model.core.cache && options.cache && !options.fields) {
                    var cacheDoc = _.cloneDeep(target);
                    return this.model.cache.set(conditions, cacheDoc);
                }
            }).then(() => {
                // Transform the document
                this.model.helpers.transform.apply(target);

                // Wrap the document and trigger the ready hook
                var wrapped: TResult = wrapper(target, false, !!options.fields);

                if (this.model.options.hooks.ready && wrapped instanceof instance) return Promise.resolve(this.model.options.hooks.ready(<TInstance><any>wrapped)).then(() => wrapped);
                return wrapped;
            });
        });
    }

    creatingDocuments(documents: TDocument[]): Promise<any[]> {
        return Promise.all(documents.map((document: any) => {
            return Promise.resolve().then(() => {
                if (this.model.options.hooks.retrieved) return this.model.options.hooks.creating(document);
            }).then(() => {
                var validation: SkmatcCore.IResult = this.model.helpers.validate(document);
                if (validation.failed) return Promise.reject(validation.error);
                this.model.helpers.transform.reverse(document);
                return document;
            });
        }));
    }

    savingDocument(instance: TInstance, changes: any): Promise<TInstance> {
        return Promise.resolve().then(() => {
            if (this.model.options.hooks.saving) return this.model.options.hooks.saving(instance, changes);
        }).then(() => instance);
    }
}

export function ModelSpecificInstance<TDocument, TInstance>(model: Model<TDocument, TInstance>, instanceType: InstanceConstructor<TDocument, TInstance>): new (doc: TDocument, isNew?: boolean, isPartial?: boolean) => TInstance {
    var constructor = function (doc: TDocument, isNew?: boolean, isPartial?: boolean) {
        instanceType.call(this, model, doc, isNew, isPartial);
    };

    util.inherits(constructor, instanceType);

    _.each(Object.keys(model.schema),(property) => {
        Object.defineProperty(constructor.prototype, property, {
            get: function () {
                return this._modified[property];
            },
            set: function (value) {
                this._modified[property] = value;
            },
            enumerable: true
        });
    });

    return <any>constructor;
}

export interface QueryOptions {
    cache?: boolean;
    fields?: { [name: string]: number };
    limit?: number;
    skip?: number;
    sort?: IndexSpecification;
}

export interface CreateOptions {
    w?: any;
    upsert?: boolean;
    cache?: boolean;
}

export interface UpdateOptions {
    w?: any;
    multi?: boolean;
}

export interface IndexSpecification {
    [key: string]: number;
}

export interface Index {
    spec: IndexSpecification;
    options?: MongoDB.IndexOptions;
}

class ModelCache {
    constructor(model: IModelBase) {
        this._model = model;
    }

    private _model: IModelBase;
    get model(): IModelBase {
        return this._model;
    }

    set<T>(conditions: any, value: T): Promise<T> {
        if (!this.model.cacheDirector || !this.model.cacheDirector.valid(conditions)) return Promise.resolve(value);
        return this.model.core.cache.set(this.model.cacheDirector.buildKey(conditions), value);
    }

    get<T>(conditions: any): Promise<T> {
        if (!this.model.cacheDirector || !this.model.cacheDirector.valid(conditions)) return Promise.resolve(<T>null);
        return this.model.core.cache.get<T>(this.model.cacheDirector.buildKey(conditions));
    }

    clear(conditions: any): Promise<boolean> {
        if (!this.model.cacheDirector || !this.model.cacheDirector.valid(conditions)) return Promise.resolve(false);
        return this.model.core.cache.clear(this.model.cacheDirector.buildKey(conditions));
    }
}
