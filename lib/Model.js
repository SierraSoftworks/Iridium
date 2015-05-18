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
var Model = (function () {
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
        get: function () {
            return this._options;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "helpers", {
        get: function () {
            return this._helpers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "handlers", {
        get: function () {
            return this._handlers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "schema", {
        get: function () {
            return this._schema;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "core", {
        get: function () {
            return this._core;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "collection", {
        get: function () {
            if (!this.core.connection)
                throw new Error("Iridium Core not connected to a database.");
            return this.core.connection.collection(this._collection);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "collectionName", {
        get: function () {
            return this._collection;
        },
        set: function (value) {
            this._collection = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "cacheDirector", {
        get: function () {
            return this._cacheDirector;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "cache", {
        get: function () {
            return this._cache;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "Instance", {
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
                return _this._handlers.creatingDocuments(objects).then(function (objects) {
                    return new Bluebird(function (resolve, reject) {
                        _this.collection.insertMany(objects, queryOptions, function (err, result) {
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
            w: 'majority',
            multi: true
        });
        return Bluebird.resolve().then(function () {
            if (conditions.hasOwnProperty('_id'))
                conditions['_id'] = _this.options.identifier.reverse(conditions['_id']);
            return new Bluebird(function (resolve, reject) {
                _this.collection.updateMany(conditions, changes, options, function (err, response) {
                    if (err)
                        return reject(err);
                    if (response.result && response.result.nModified !== undefined)
                        return resolve(response.result.nModified);
                    return resolve(response.result.n);
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
    Model.prototype.remove = function (conditions, options, callback) {
        var _this = this;
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        if (typeof conditions === 'function') {
            callback = conditions;
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
            if (conditions.hasOwnProperty('_id'))
                conditions['_id'] = _this.options.identifier.reverse(conditions['_id']);
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