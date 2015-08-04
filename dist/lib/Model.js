/// <reference path="../_references.d.ts" />
var MongoDB = require('mongodb');
var Bluebird = require('bluebird');
var _ = require('lodash');
var Core_1 = require('./Core');
var Instance_1 = require('./Instance');
var Cursor_1 = require('./Cursor');
var ModelCache_1 = require('./ModelCache');
var ModelHelpers_1 = require('./ModelHelpers');
var ModelHandlers_1 = require('./ModelHandlers');
var ModelSpecificInstance_1 = require('./ModelSpecificInstance');
/**
 * An Iridium Model which represents a structured MongoDB collection
 * @class
 */
var Model = (function () {
    /**
     * Creates a new Iridium model representing a given ISchema and backed by a collection whose name is specified
     * @param {Iridium} core The Iridium core that this model should use for database access
     * @param {ModelInterfaces.InstanceImplementation} instanceType The class which will be instantiated for each document retrieved from the database
     * @returns {Model}
     * @constructor
     */
    function Model(core, instanceType) {
        this._hooks = {};
        if (!(core instanceof Core_1.default))
            throw new Error("You failed to provide a valid Iridium core for this model");
        if (typeof instanceType != 'function')
            throw new Error("You failed to provide a valid instance constructor for this model");
        if (typeof instanceType.collection != 'string' || !instanceType.collection)
            throw new Error("You failed to provide a valid collection name for this model");
        if (!_.isPlainObject(instanceType.schema) || instanceType.schema._id === undefined)
            throw new Error("You failed to provide a valid schema for this model");
        this._core = core;
        this.loadExternal(instanceType);
        this.onNewModel();
        this.loadInternal();
    }
    Model.prototype.loadExternal = function (instanceType) {
        this._collection = instanceType.collection;
        this._schema = instanceType.schema;
        this._hooks = instanceType;
        this._cacheDirector = instanceType.cache;
        this._transforms = instanceType.transforms || {};
        this._validators = instanceType.validators || [];
        this._indexes = instanceType.indexes || [];
        if (!this._schema._id)
            this._schema._id = MongoDB.ObjectID;
        if (this._schema._id === MongoDB.ObjectID && !this._transforms['_id'])
            this._transforms['_id'] = {
                fromDB: function (value) { return value._bsontype == 'ObjectID' ? new MongoDB.ObjectID(value.id).toHexString() : value; },
                toDB: function (value) { return value && typeof value === 'string' ? new MongoDB.ObjectID(value) : value; }
            };
        if (instanceType.prototype instanceof Instance_1.default)
            this._Instance = ModelSpecificInstance_1.default(this, instanceType);
        else
            this._Instance = instanceType.bind(undefined, this);
    };
    Model.prototype.loadInternal = function () {
        this._cache = new ModelCache_1.default(this);
        this._helpers = new ModelHelpers_1.default(this);
        this._handlers = new ModelHandlers_1.default(this);
    };
    Model.prototype.onNewModel = function () {
        var _this = this;
        this._core.plugins.forEach(function (plugin) { return plugin.newModel && plugin.newModel(_this); });
    };
    Object.defineProperty(Model.prototype, "helpers", {
        /**
         * Provides helper methods used by Iridium for common tasks
         * @returns {ModelHelpers}
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
         * @returns {ModelHandlers}
         */
        get: function () {
            return this._handlers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "hooks", {
        /**
         * Gets the even hooks subscribed on this model for a number of different state changes
         * @returns {Hooks}
         */
        get: function () {
            return this._hooks;
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
    Object.defineProperty(Model.prototype, "transforms", {
        get: function () {
            return this._transforms;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "validators", {
        get: function () {
            return this._validators;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "indexes", {
        get: function () {
            return this._indexes;
        },
        enumerable: true,
        configurable: true
    });
    Model.prototype.find = function (conditions, fields) {
        conditions = conditions || {};
        fields = fields || {};
        if (!_.isPlainObject(conditions))
            conditions = { _id: conditions };
        conditions = this._helpers.convertToDB(conditions);
        var cursor = this.collection.find(conditions, {
            fields: fields
        });
        return new Cursor_1.default(this, conditions, cursor);
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
            conditions = _this._helpers.convertToDB(conditions);
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
        if (Array.isArray(objs))
            objects = objs;
        else
            objects = [objs];
        options = options || {};
        _.defaults(options, {
            w: 'majority',
            forceServerObjectId: true
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
                return _this._handlers.creatingDocuments(objects).then(function (objects) { return _.chunk(objects, 1000); }).map(function (objects) {
                    return new Bluebird(function (resolve, reject) {
                        _this.collection.insertMany(objects, queryOptions, function (err, result) {
                            if (err)
                                return reject(err);
                            return resolve(result.ops);
                        });
                    });
                }).then(function (results) { return _.flatten(results); });
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
            w: 'majority',
            multi: true
        });
        return Bluebird.resolve().then(function () {
            conditions = _this._helpers.convertToDB(conditions);
            return new Bluebird(function (resolve, reject) {
                _this.collection.updateMany(conditions, changes, options, function (err, response) {
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
    };
    Model.prototype.count = function (conds, callback) {
        var _this = this;
        var conditions = conds;
        if (typeof conds == 'function') {
            callback = conds;
            conditions = {};
        }
        conditions = conditions || {};
        if (!_.isPlainObject(conditions))
            conditions = {
                _id: conditions
            };
        return Bluebird.resolve().then(function () {
            conditions = _this._helpers.convertToDB(conditions);
            return new Bluebird(function (resolve, reject) {
                _this.collection.count(conditions, function (err, results) {
                    if (err)
                        return reject(err);
                    return resolve(results);
                });
            });
        }).nodeify(callback);
    };
    Model.prototype.remove = function (conds, options, callback) {
        var _this = this;
        var conditions = conds;
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        if (typeof conds == 'function') {
            callback = conds;
            options = {};
            conditions = {};
        }
        conditions = conditions || {};
        options = options || {};
        _.defaults(options, {
            w: 'majority'
        });
        if (!_.isPlainObject(conditions))
            conditions = {
                _id: conditions
            };
        return Bluebird.resolve().then(function () {
            conditions = _this._helpers.convertToDB(conditions);
            return new Bluebird(function (resolve, reject) {
                _this.collection.remove(conditions, options, function (err, response) {
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
    Model.prototype.aggregate = function (pipeline) {
        var _this = this;
        return new Bluebird(function (resolve, reject) {
            _this.collection.aggregate(pipeline, function (err, results) {
                if (err)
                    return reject(err);
                return resolve(results);
            });
        });
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
        return Bluebird.resolve(this._indexes).map(function (index) {
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
exports.default = Model;

//# sourceMappingURL=../lib/Model.js.map