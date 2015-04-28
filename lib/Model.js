/// <reference path="../_references.d.ts" />
var MongoDB = require('mongodb');
var Bluebird = require('bluebird');
var _ = require('lodash');
var Iridium = require('./Core');
var instance = require('./Instance');
var Cursor = require('./Cursor');
var idCacheController = require('./cacheControllers/IDDirector');
var ModelCache = require('./ModelCache');
var ModelHelpers = require('./ModelHelpers');
var ModelHandlers = require('./ModelHandlers');
var ModelSpecificInstance = require('./ModelSpecificInstance');
/**
 * An Iridium Model which represents a structured MongoDB collection
 * @class
 */
var Model = (function () {
    /**
     * Creates a new Iridium model representing a given ISchema and backed by a collection whose name is specified
     * @param {Iridium} core The Iridium core that this model should use for database access
     * @param {String} collection The name of the collection within the database which should be used by this model
     * @param {schema} schema The schema defining the data validations to be performed on the model
     * @param {IModelOptions} options The options dictating the behaviour of the model
     * @returns {Model}
     * @constructor
     */
    function Model(core, instanceType, collection, schema, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        if (!(core instanceof Iridium))
            throw new Error("You failed to provide a valid Iridium core for this model");
        if (typeof instanceType != 'function')
            throw new Error("You failed to provide a valid instance constructor for this model");
        if (typeof collection != 'string' || !collection)
            throw new Error("You failed to provide a valid collection name for this model");
        if (!_.isPlainObject(schema) || schema._id === undefined)
            throw new Error("You failed to provide a valid schema for this model");
        _.defaults(options, {
            hooks: {},
            identifier: {
                apply: function (value) {
                    return (value && value._bsontype == 'ObjectID') ? new MongoDB.ObjectID(value.id).toHexString() : value;
                },
                reverse: function (value) {
                    if (value === null || value === undefined)
                        return undefined;
                    if (value && /^[a-f0-9]{24}$/.test(value))
                        return MongoDB.ObjectID.createFromHexString(value);
                    return value;
                }
            },
            cache: new idCacheController()
        });
        this._core = core;
        this._collection = collection;
        this._schema = schema;
        this._options = options;
        core.plugins.forEach(function (plugin) {
            if (plugin.newModel)
                plugin.newModel(_this);
        });
        this._cacheDirector = options.cache;
        this._cache = new ModelCache(this);
        if (instanceType.prototype instanceof instance)
            this._Instance = ModelSpecificInstance(this, instanceType);
        else
            this._Instance = (instanceType.bind(undefined, this));
        this._helpers = new ModelHelpers(this);
        this._handlers = new ModelHandlers(this);
    }
    Object.defineProperty(Model.prototype, "options", {
        /**
         * Gets the options provided when instantiating this model
         * @public
         * @returns {IModelOptions<TSchema>}
         * @description
         * This is intended to be consumed by plugins which require any configuration
         * options. Changes made to this object after the {plugin.newModel} hook are
         * called will not have any effect on this model.
         */
        get: function () {
            return this._options;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "helpers", {
        /**
         * Provides helper methods used by Iridium for common tasks
         * @returns {ModelHelpers<TSchema>}
         */
        get: function () {
            return this._helpers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "handlers", {
        /**
         * Provides helper methods used by Iridium for hook delegation and common processes
         * @returns {ModelHandlers<TSchema>}
         */
        get: function () {
            return this._handlers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "schema", {
        /**
         * Gets the ISchema dictating the data structure represented by this model
         * @public
         * @returns {schema}
         */
        get: function () {
            return this._schema;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "core", {
        /**
         * Gets the Iridium core that this model is associated with
         * @public
         * @returns {Iridium}
         */
        get: function () {
            return this._core;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "collection", {
        /**
         * Gets the underlying MongoDB collection from which this model's documents are retrieved
         * @public
         * @returns {Collection}
         */
        get: function () {
            if (!this.core.connection)
                throw new Error("Iridium Core not connected to a database.");
            return this.core.connection.collection(this._collection);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "collectionName", {
        /**
         * Gets the name of the underlying MongoDB collection from which this model's documents are retrieved
         * @public
         */
        get: function () {
            return this._collection;
        },
        /**
         * Sets the name of the underlying MongoDB collection from which this model's documents are retrieved
         * @public
         */
        set: function (value) {
            this._collection = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "cacheDirector", {
        /**
         * Gets the cache controller which dictates which queries will be cached, and under which key
         * @public
         * @returns {CacheDirector}
         */
        get: function () {
            return this._cacheDirector;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "cache", {
        /**
         * Gets the cache responsible for storing objects for quick retrieval under certain conditions
         * @public
         * @returns {ModelCache}
         */
        get: function () {
            return this._cache;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "Instance", {
        /**
         * Gets the constructor responsible for creating instances for this model
         */
        get: function () {
            return this._Instance;
        },
        enumerable: true,
        configurable: true
    });
    Model.prototype.find = function (conditions, fields) {
        conditions = conditions || {};
        fields = fields || {};
        if (!_.isPlainObject(conditions))
            conditions = { _id: conditions };
        if (conditions.hasOwnProperty('_id'))
            conditions['_id'] = this.options.identifier.reverse(conditions['_id']);
        var cursor = this.collection.find(conditions, {
            fields: fields
        });
        return new Cursor(this, conditions, cursor);
    };
    Model.prototype.get = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this.findOne.apply(this, args);
    };
    Model.prototype.findOne = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var conditions = null;
        var options = null;
        var callback = null;
        for (var argI = 0; argI < args.length; argI++) {
            if (typeof args[argI] == 'function')
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
        return Bluebird.resolve().bind(this).then(function () {
            if (conditions.hasOwnProperty('_id'))
                conditions['_id'] = _this.options.identifier.reverse(conditions['_id']);
            return _this._cache.get(conditions);
        }).then(function (cachedDocument) {
            if (cachedDocument)
                return cachedDocument;
            return new Bluebird(function (resolve, reject) {
                _this.collection.findOne(conditions, {
                    fields: options.fields,
                    skip: options.skip,
                    sort: options.sort,
                    limit: options.limit
                }, function (err, result) {
                    if (err)
                        return reject(err);
                    return resolve(result);
                });
            });
        }).then(function (document) {
            if (!document)
                return null;
            return _this._handlers.documentReceived(conditions, document, function (document, isNew, isPartial) { return _this._helpers.wrapDocument(document, isNew, isPartial); }, options);
        }).nodeify(callback);
    };
    Model.prototype.create = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this.insert.apply(this, args);
    };
    Model.prototype.insert = function (objs) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var objects;
        var options = {};
        var callback = null;
        if (typeof args[0] == 'function')
            callback = args[0];
        else {
            options = args[0];
            callback = args[1];
        }
        var returnArray = false;
        if (Array.isArray(objs))
            objects = objs;
        else
            objects = [objs];
        options = options || {};
        _.defaults(options, {
            w: 1
        });
        return Bluebird.resolve().then(function () {
            var queryOptions = { w: options.w, upsert: options.upsert, new: true };
            if (options.upsert) {
                var docs = _this._handlers.creatingDocuments(objects);
                return docs.map(function (object) {
                    return new Bluebird(function (resolve, reject) {
                        _this.collection.findAndModify({ _id: object._id }, ["_id"], object, queryOptions, function (err, result) {
                            if (err)
                                return reject(err);
                            return resolve(result);
                        });
                    });
                });
            }
            else
                return _this._handlers.creatingDocuments(objects).then(function (objects) {
                    return new Bluebird(function (resolve, reject) {
                        _this.collection.insert(objects, queryOptions, function (err, result) {
                            if (err)
                                return reject(err);
                            return resolve(result.ops);
                        });
                    });
                });
        }).map(function (inserted) {
            return _this._handlers.documentReceived(null, inserted, function (document, isNew, isPartial) { return _this._helpers.wrapDocument(document, isNew, isPartial); }, { cache: options.cache });
        }).then(function (results) {
            if (Array.isArray(objs))
                return results;
            return results[0];
        }).nodeify(callback);
    };
    Model.prototype.update = function (conditions, changes, options, callback) {
        var _this = this;
        if (typeof options == 'function') {
            callback = options;
            options = {};
        }
        options = options || {};
        if (!_.isPlainObject(conditions))
            conditions = {
                _id: conditions
            };
        _.defaults(options, {
            w: 1,
            multi: true
        });
        return Bluebird.resolve().then(function () {
            if (conditions.hasOwnProperty('_id'))
                conditions['_id'] = _this.options.identifier.reverse(conditions['_id']);
            return new Bluebird(function (resolve, reject) {
                _this.collection.update(conditions, changes, options, function (err, response) {
                    if (err)
                        return reject(err);
                    console.log("update(): %j", response);
                    // New MongoDB 2.6+ response type
                    if (response.result && response.result.nModified !== undefined)
                        return resolve(response.result.nModified);
                    // Legacy response type
                    return resolve(response.nModified);
                });
            });
        }).nodeify(callback);
    };
    Model.prototype.count = function (conditions, callback) {
        var _this = this;
        if (typeof conditions == 'function') {
            callback = conditions;
            conditions = {};
        }
        conditions = conditions || {};
        if (!_.isPlainObject(conditions))
            conditions = {
                _id: conditions
            };
        return Bluebird.resolve().then(function () {
            if (conditions.hasOwnProperty('_id'))
                conditions['_id'] = _this.options.identifier.reverse(conditions['_id']);
            return new Bluebird(function (resolve, reject) {
                _this.collection.count(conditions, function (err, results) {
                    if (err)
                        return reject(err);
                    return resolve(results);
                });
            });
        }).nodeify(callback);
    };
    Model.prototype.remove = function (conditions, callback) {
        var _this = this;
        if (typeof conditions == 'function') {
            callback = conditions;
            conditions = {};
        }
        conditions = conditions || {};
        if (!_.isPlainObject(conditions))
            conditions = {
                _id: conditions
            };
        return Bluebird.resolve().then(function () {
            if (conditions.hasOwnProperty('_id'))
                conditions['_id'] = _this.options.identifier.reverse(conditions['_id']);
            return new Bluebird(function (resolve, reject) {
                _this.collection.remove(conditions, function (err, response) {
                    if (err)
                        return reject(err);
                    return resolve(response.result.n);
                });
            });
        }).then(function (count) {
            if (count === 1)
                _this._cache.clear(conditions);
            return Bluebird.resolve(count);
        }).nodeify(callback);
    };
    Model.prototype.ensureIndex = function (specification, options, callback) {
        var _this = this;
        if (typeof options == 'function') {
            callback = options;
            options = {};
        }
        return new Bluebird(function (resolve, reject) {
            _this.collection.ensureIndex(specification, options, function (err, name) {
                if (err)
                    return reject(err);
                return resolve(name);
            });
        }).nodeify(callback);
    };
    /**
     * Ensures that all indexes defined in the model's options are created
     * @param {function(Error, String[])} callback A callback which is triggered when the operation completes
     * @returns {Promise<String[]>} The names of the indexes
     */
    Model.prototype.ensureIndexes = function (callback) {
        var _this = this;
        return Bluebird.resolve(this.options.indexes).map(function (index) {
            return _this.ensureIndex(index.spec || index, index.options || {});
        }).nodeify(callback);
    };
    Model.prototype.dropIndex = function (specification, callback) {
        var _this = this;
        var index;
        if (typeof (specification) === 'string')
            index = specification;
        else {
            index = _(specification).map(function (direction, key) { return key + '_' + direction; }).reduce(function (x, y) { return x + '_' + y; });
        }
        return new Bluebird(function (resolve, reject) {
            _this.collection.dropIndex(index, function (err, result) {
                if (err)
                    return reject(err);
                return resolve(!!result.ok);
            });
        }).nodeify(callback);
    };
    /**
     * Removes all indexes (except for _id) from the collection
     * @param {function(Error, Boolean)} callback A callback which is triggered when the operation completes
     * @returns {Promise<Boolean>} Whether the indexes were dropped
     */
    Model.prototype.dropIndexes = function (callback) {
        var _this = this;
        return new Bluebird(function (resolve, reject) {
            _this.collection.dropAllIndexes(function (err, count) {
                if (err)
                    return reject(err);
                return resolve(count);
            });
        }).nodeify(callback);
    };
    return Model;
})();
module.exports = Model;
//# sourceMappingURL=Model.js.map