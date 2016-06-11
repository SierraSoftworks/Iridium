"use strict";
const MongoDB = require("mongodb");
const Bluebird = require("bluebird");
const _ = require("lodash");
const Core_1 = require("./Core");
const Instance_1 = require("./Instance");
const Cursor_1 = require("./Cursor");
const ModelCache_1 = require("./ModelCache");
const ModelHelpers_1 = require("./ModelHelpers");
const ModelHandlers_1 = require("./ModelHandlers");
const ModelSpecificInstance_1 = require("./ModelSpecificInstance");
const Transforms_1 = require("./Transforms");
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
class Model {
    /**
     * Creates a new Iridium model representing a given ISchema and backed by a collection whose name is specified
     * @param core The Iridium core that this model should use for database access
     * @param instanceType The class which will be instantiated for each document retrieved from the database
     * @constructor
     */
    constructor(core, instanceType) {
        this._hooks = {};
        if (!(core instanceof Core_1.Core))
            throw new Error("You failed to provide a valid Iridium core for this model");
        if (typeof instanceType !== "function")
            throw new Error("You failed to provide a valid instance constructor for this model");
        if (typeof instanceType.collection !== "string" || !instanceType.collection)
            throw new Error("You failed to provide a valid collection name for this model");
        if (!_.isPlainObject(instanceType.schema) || instanceType.schema._id === undefined)
            throw new Error("You failed to provide a valid schema for this model");
        this._core = core;
        this.loadExternal(instanceType);
        this.onNewModel();
        this.loadInternal();
    }
    /**
     * Loads any externally available properties (generally accessed using public getters/setters).
     */
    loadExternal(instanceType) {
        this._collection = instanceType.collection;
        this._schema = instanceType.schema;
        this._hooks = instanceType;
        this._cacheDirector = instanceType.cache;
        this._transforms = instanceType.transforms || {};
        this._validators = instanceType.validators || [];
        this._indexes = instanceType.indexes || [];
        if (!this._schema._id)
            this._schema._id = MongoDB.ObjectID;
        if (this._schema._id === MongoDB.ObjectID && !this._transforms._id)
            this._transforms._id = Transforms_1.DefaultTransforms.ObjectID;
        if (instanceType.prototype instanceof Instance_1.Instance)
            this._Instance = ModelSpecificInstance_1.ModelSpecificInstance(this, instanceType);
        else
            this._Instance = instanceType.bind(undefined, this);
    }
    /**
     * Loads any internally (protected/private) properties and helpers only used within Iridium itself.
     */
    loadInternal() {
        this._cache = new ModelCache_1.ModelCache(this);
        this._helpers = new ModelHelpers_1.ModelHelpers(this);
        this._handlers = new ModelHandlers_1.ModelHandlers(this);
    }
    /**
     * Process any callbacks and plugin delegation for the creation of this model.
     * It will generally be called whenever a new Iridium Core is created, however is
     * more specifically tied to the lifespan of the models themselves.
     */
    onNewModel() {
        this._core.plugins.forEach(plugin => plugin.newModel && plugin.newModel(this));
    }
    /**
     * Provides helper methods used by Iridium for common tasks
     * @returns A set of helper methods which are used within Iridium for common tasks
     */
    get helpers() {
        return this._helpers;
    }
    /**
     * Provides helper methods used by Iridium for hook delegation and common processes
     * @returns A set of helper methods which perform common event and response handling tasks within Iridium.
     */
    get handlers() {
        return this._handlers;
    }
    /**
     * Gets the even hooks subscribed on this model for a number of different state changes.
     * These hooks are primarily intended to allow lifecycle manipulation logic to be added
     * in the user's model definition, allowing tasks such as the setting of default values
     * or automatic client-side joins to take place.
     */
    get hooks() {
        return this._hooks;
    }
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
    get schema() {
        return this._schema;
    }
    /**
     * Gets the Iridium core that this model is associated with.
     * @public
     * @returns The Iridium core that this model is bound to
     */
    get core() {
        return this._core;
    }
    /**
     * Gets the underlying MongoDB collection from which this model's documents are retrieved.
     * You can make use of this object if you require any low level access to the MongoDB collection,
     * however we recommend you make use of the Iridium methods whereever possible, as we cannot
     * guarantee the accuracy of the type definitions for the underlying MongoDB driver.
     * @public
     * @returns {Collection}
     */
    get collection() {
        if (!this.core.connection)
            throw new Error("Iridium Core not connected to a database.");
        return this.core.connection.collection(this._collection);
    }
    /**
     * Gets the name of the underlying MongoDB collection from which this model's documents are retrieved
     * @public
     */
    get collectionName() {
        return this._collection;
    }
    /**
     * Sets the name of the underlying MongoDB collection from which this model's documents are retrieved
     * @public
     */
    set collectionName(value) {
        this._collection = value;
    }
    /**
     * Gets the cache controller which dictates which queries will be cached, and under which key
     * @public
     * @returns {CacheDirector}
     */
    get cacheDirector() {
        return this._cacheDirector;
    }
    /**
     * Gets the cache responsible for storing objects for quick retrieval under certain conditions
     * @public
     * @returns {ModelCache}
     */
    get cache() {
        return this._cache;
    }
    /**
     * Gets the constructor responsible for creating instances for this model
     */
    get Instance() {
        return this._Instance;
    }
    /**
     * Gets the transforms which are applied whenever a document is received from the database, or
     * prior to storing a document in the database. Tasks such as converting an ObjectID to a string
     * and vice versa are all listed in this object.
     */
    get transforms() {
        return this._transforms;
    }
    /**
     * Gets the custom validation types available for this model. These validators are added to the
     * default skmatc validators, as well as those available through plugins, for use when checking
     * your instances.
     */
    get validators() {
        return this._validators;
    }
    /**
     * Gets the indexes which Iridium will manage on this model's database collection.
     */
    get indexes() {
        return this._indexes;
    }
    find(conditions, fields) {
        conditions = conditions || {};
        if (!_.isPlainObject(conditions))
            conditions = { _id: conditions };
        conditions = this._helpers.convertToDB(conditions);
        let cursor = this.collection.find(conditions);
        if (fields)
            cursor = cursor.project(fields);
        return new Cursor_1.Cursor(this, conditions, cursor);
    }
    get(...args) {
        return this.findOne.apply(this, args);
    }
    findOne(...args) {
        let conditions = null;
        let options = null;
        let callback = null;
        for (let argI = 0; argI < args.length; argI++) {
            if (typeof args[argI] === "function")
                callback = callback || args[argI];
            else if (_.isPlainObject(args[argI])) {
                if (conditions)
                    options = args[argI];
                else
                    conditions = args[argI];
            }
            else
                conditions = { _id: args[argI] };
        }
        conditions = conditions || {};
        options = options || {};
        _.defaults(options, {
            cache: true
        });
        return Bluebird.resolve().bind(this).then(() => {
            conditions = this._helpers.convertToDB(conditions);
            return this._cache.get(conditions);
        }).then((cachedDocument) => {
            if (cachedDocument)
                return cachedDocument;
            return new Bluebird((resolve, reject) => {
                let cursor = this.collection.find(conditions);
                if (options.sort)
                    cursor = cursor.sort(options.sort);
                if (typeof options.skip === "number")
                    cursor = cursor.skip(options.skip);
                cursor = cursor.limit(1);
                if (options.fields)
                    cursor = cursor.project(options.fields);
                return cursor.next((err, result) => {
                    if (err)
                        return reject(err);
                    return resolve(result);
                });
            });
        }).then((document) => {
            if (!document)
                return null;
            return this._handlers.documentReceived(conditions, document, (document, isNew, isPartial) => this._helpers.wrapDocument(document, isNew, isPartial), options);
        }).nodeify(callback);
    }
    create(...args) {
        return this.insert.apply(this, args);
    }
    insert(objs, ...args) {
        let objects;
        let options = {};
        let callback = null;
        if (typeof args[0] === "function")
            callback = args[0];
        else {
            options = args[0];
            callback = args[1];
        }
        if (Array.isArray(objs))
            objects = objs;
        else
            objects = [objs];
        options = options || {};
        _.defaults(options, {
            w: "majority",
            forceServerObjectId: true
        });
        return Bluebird.resolve().then(() => {
            let queryOptions = { w: options.w, upsert: options.upsert, new: true };
            if (options.upsert) {
                let docs = this._handlers.creatingDocuments(objects);
                return docs.map((object) => {
                    return new Bluebird((resolve, reject) => {
                        this.collection.findOneAndUpdate({ _id: object._id }, object, {
                            upsert: options.upsert,
                            returnOriginal: false
                        }, (err, result) => {
                            if (err)
                                return reject(err);
                            return resolve(result.value);
                        });
                    });
                });
            }
            else
                return this._handlers.creatingDocuments(objects).then(objects => _.chunk(objects, 1000)).map((objects) => {
                    return new Bluebird((resolve, reject) => {
                        this.collection.insertMany(objects, queryOptions, (err, result) => {
                            if (err)
                                return reject(err);
                            return resolve(result.ops);
                        });
                    });
                }).then(results => _.flatten(results));
        }).map((inserted) => {
            return this._handlers.documentReceived(null, inserted, (document, isNew, isPartial) => this._helpers.wrapDocument(document, isNew, isPartial), { cache: options.cache });
        }).then((results) => {
            if (Array.isArray(objs))
                return results;
            return results[0];
        }).nodeify(callback);
    }
    update(conditions, changes, options, callback) {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }
        options = options || {};
        if (!_.isPlainObject(conditions))
            conditions = {
                _id: conditions
            };
        _.defaults(options, {
            w: "majority",
            multi: true
        });
        return Bluebird.resolve().then(() => {
            conditions = this._helpers.convertToDB(conditions);
            return new Bluebird((resolve, reject) => {
                this.collection.updateMany(conditions, changes, options, (err, response) => {
                    if (err)
                        return reject(err);
                    // New MongoDB 2.6+ response type
                    if (response.result && response.result.nModified !== undefined)
                        return resolve(response.result.nModified);
                    // Legacy response type
                    return resolve(response.result.n);
                });
            });
        }).nodeify(callback);
    }
    count(conds, callback) {
        let conditions = conds;
        if (typeof conds === "function") {
            callback = conds;
            conditions = {};
        }
        conditions = conditions || {};
        if (!_.isPlainObject(conditions))
            conditions = {
                _id: conditions
            };
        return Bluebird.resolve().then(() => {
            conditions = this._helpers.convertToDB(conditions);
            return new Bluebird((resolve, reject) => {
                this.collection.count(conditions, (err, results) => {
                    if (err)
                        return reject(err);
                    return resolve(results);
                });
            });
        }).nodeify(callback);
    }
    remove(conds, options, callback) {
        let conditions = conds;
        if (typeof options === "function") {
            callback = options;
            options = {};
        }
        if (typeof conds === "function") {
            callback = conds;
            options = {};
            conditions = {};
        }
        conditions = conditions || {};
        options = options || {};
        _.defaults(options, {
            w: "majority"
        });
        if (!_.isPlainObject(conditions))
            conditions = {
                _id: conditions
            };
        return Bluebird.resolve().then(() => {
            conditions = this._helpers.convertToDB(conditions);
            return new Bluebird((resolve, reject) => {
                if (options.single)
                    return this.collection.deleteOne(conditions, options, (err, response) => {
                        if (err)
                            return reject(err);
                        return resolve(response.result.n);
                    });
                this.collection.deleteMany(conditions, options, (err, response) => {
                    if (err)
                        return reject(err);
                    return resolve(response.result.n);
                });
            });
        }).then((count) => {
            if (count === 1)
                this._cache.clear(conditions);
            return Bluebird.resolve(count);
        }).nodeify(callback);
    }
    aggregate(pipeline) {
        return new Bluebird((resolve, reject) => {
            this.collection.aggregate(pipeline, (err, results) => {
                if (err)
                    return reject(err);
                return resolve(results);
            });
        });
    }
    ensureIndex(specification, options, callback) {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }
        return new Bluebird((resolve, reject) => {
            this.collection.createIndex(specification, options, (err, name) => {
                if (err)
                    return reject(err);
                return resolve(name);
            });
        }).nodeify(callback);
    }
    /**
     * Ensures that all indexes defined in the model's options are created
     * @param {function(Error, String[])} callback A callback which is triggered when the operation completes
     * @returns {Promise<String[]>} The names of the indexes
     */
    ensureIndexes(callback) {
        return Bluebird.resolve(this._indexes).map((index) => {
            return this.ensureIndex(index.spec || index, index.options || {});
        }).nodeify(callback);
    }
    dropIndex(specification, callback) {
        let index;
        if (typeof (specification) === "string")
            index = specification;
        else {
            index = _(specification).map((direction, key) => `${key}_${direction}`).reduce((x, y) => `${x}_${y}`);
        }
        return new Bluebird((resolve, reject) => {
            this.collection.dropIndex(index, (err, result) => {
                if (err)
                    return reject(err);
                return resolve(!!result.ok);
            });
        }).nodeify(callback);
    }
    /**
     * Removes all indexes (except for _id) from the collection
     * @param {function(Error, Boolean)} callback A callback which is triggered when the operation completes
     * @returns {Promise<Boolean>} Whether the indexes were dropped
     */
    dropIndexes(callback) {
        return new Bluebird((resolve, reject) => {
            this.collection.dropIndexes((err, count) => {
                if (err)
                    return reject(err);
                return resolve(count);
            });
        }).nodeify(callback);
    }
}
exports.Model = Model;

//# sourceMappingURL=Model.js.map
