/// <reference path="../_references.d.ts" />
var MongoDB = require('mongodb');
var Skmatc = require('skmatc');
var Concoction = require('concoction');
var Promise = require('bluebird');
var util = require('util');
var _ = require('lodash');
var Iridium = require('./Core');
var idCacheController = require('./cacheControllers/IDDirector');
var Omnom = require('./utils/Omnom');
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
        if (options === void 0) { options = {}; }
        // Allow instantiation doing `require('iridium').Model(db, 'collection', {})`
        if (!(this instanceof Model))
            return new Model(core, instanceType, collection, schema, options);
        if (!(core instanceof Iridium))
            throw new Error("You failed to provide a valid Iridium core for this model");
        if (typeof instanceType != 'function')
            throw new Error("You failed to provide a valid instance constructor for this model");
        if (typeof collection != 'string' || !collection)
            throw new Error("You failed to provide a valid collection name for this model");
        if (!_.isPlainObject(schema) || !_.keys(schema).length)
            throw new Error("You failed to provide a valid schema for this model");
        options = options || {};
        _.defaults(options, {
            hooks: {},
            transforms: [
                new Concoction.Rename({ _id: 'id' }),
                new Concoction.Convert({
                    id: {
                        apply: function (value) {
                            return (value && value.id) ? new MongoDB.ObjectID(value.id).toHexString() : value;
                        },
                        reverse: function (value) {
                            if (value === null || value === undefined)
                                return undefined;
                            if (value && /^[a-f0-9]{24}$/.test(value))
                                return MongoDB.ObjectID.createFromHexString(value);
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
        core.plugins.forEach(function (plugin) {
            if (plugin.newModel)
                plugin.newModel(this);
        });
        this._cache = new ModelCache(this);
        this._Instance = new ModelSpecificInstance(this, instanceType);
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
    /**
     * Wraps the given document using the instance constructor provided for this model
     * @public
     * @param {TDocument} document The document to wrap in an instance object
     * @param {Boolean} isNew Whether the document is present in the database or not
     * @param {Boolean} isPartial Whether the document contains all properties defined in the database
     * @returns {function(Object): Instance<TSchema>}
     * @constructor
     */
    Model.prototype.wrap = function (document, isNew, isPartial) {
        if (isNew === void 0) { isNew = true; }
        if (isPartial === void 0) { isPartial = false; }
        return this._Instance.build(document, isNew, isPartial);
    };
    Model.prototype.find = function (conditions, options, callback) {
        var _this = this;
        if (typeof options == 'function') {
            callback = options;
            options = {};
        }
        if (typeof conditions == 'function') {
            callback = conditions;
            conditions = {};
            options = {};
        }
        conditions = conditions || {};
        options = options || {};
        _.defaults(options, {});
        return Promise.resolve().then(function () {
            if (options.fields)
                _this.helpers.transform.reverse(options.fields);
            if (!_.isPlainObject(conditions))
                conditions = _this.helpers.selectOneDownstream(conditions);
            _this.helpers.transform.reverse(conditions);
            var cursor = _this.collection.find(conditions, {
                limit: options.limit,
                sort: options.sort,
                skip: options.skip,
                fields: options.fields
            });
            return Promise.promisify(function (callback) {
                cursor.toArray(callback);
            })();
        }).then(function (results) {
            if (!results || !results.length)
                return Promise.resolve([]);
            return _this.handlers.documentsReceived(conditions, results, function (document, isNew, isPartial) { return _this.helpers.wrapDocument(document, isNew, isPartial); }, options);
        }).nodeify(callback);
    };
    Model.prototype.get = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this.get.apply(this, args);
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
                conditions = this.helpers.selectOneDownstream(args[argI]);
        }
        conditions = conditions || {};
        options = options || {};
        _.defaults(options, {
            wrap: true,
            cache: true
        });
        return Promise.resolve().bind(this).then(function () {
            _this.helpers.transform.reverse(conditions);
            if (options.fields)
                _this.helpers.transform.reverse(options.fields);
            return _this.cache.get(conditions);
        }).then(function (cachedDocument) {
            if (cachedDocument)
                return cachedDocument;
            return new Promise(function (resolve, reject) {
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
            return _this.handlers.documentsReceived(conditions, [document], function (document, isNew, isPartial) { return _this.helpers.wrapDocument(document, isNew, isPartial); }, options).then(function (documents) { return documents[0]; });
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
        return Promise.resolve().then(function () {
            var queryOptions = { w: options.w, upsert: options.upsert, new: true };
            if (options.upsert)
                return _this.handlers.creatingDocuments(objects).map(function (object) {
                    return new Promise(function (resolve, reject) {
                        _this.collection.findAndModify({ _id: object._id }, ["_id"], object, queryOptions, function (err, result) {
                            if (err)
                                return reject(err);
                            return resolve(result);
                        });
                    });
                });
            else
                return _this.handlers.creatingDocuments(objects).then(function (objects) {
                    return new Promise(function (resolve, reject) {
                        _this.collection.insert(objects, queryOptions, function (err, results) {
                            if (err)
                                return reject(err);
                            return resolve(results);
                        });
                    });
                });
        }).then(function (inserted) {
            return _this.handlers.documentsReceived(null, inserted, function (document, isNew, isPartial) { return _this.helpers.wrapDocument(document, isNew, isPartial); }, { cache: options.cache });
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
        _.defaults(options, {
            w: 1,
            multi: true
        });
        this.helpers.transform.reverse(conditions);
        return new Promise(function (resolve, reject) {
            _this.collection.update(conditions, changes, options, function (err, changes) {
                if (err)
                    return reject(err);
                return resolve(changes);
            });
        }).nodeify(callback);
    };
    Model.prototype.count = function (conditions, callback) {
        if (typeof conditions == 'function') {
            callback = conditions;
            conditions = {};
        }
        var $this = this;
        return new Promise(function (resolve, reject) {
            $this.collection.count(conditions, function (err, results) {
                if (err)
                    return reject(err);
                return resolve(results);
            });
        }).nodeify(callback);
    };
    Model.prototype.remove = function (conditions, callback) {
        var _this = this;
        if (typeof conditions == 'function') {
            callback = conditions;
            conditions = {};
        }
        return new Promise(function (resolve, reject) {
            _this.collection.remove(conditions, function (err, results) {
                if (err)
                    return reject(err);
                return resolve(results);
            });
        }).then(function (count) {
            return _this.cache.clear(conditions).then(function () { return count; });
        }).nodeify(callback);
    };
    Model.prototype.ensureIndex = function (specification, options, callback) {
        var _this = this;
        if (typeof options == 'function') {
            callback = options;
            options = {};
        }
        return new Promise(function (resolve, reject) {
            _this.collection.ensureIndex(specification, options, function (err, name) {
                if (err)
                    return reject(err);
                return resolve(name);
            });
        }).nodeify(callback);
    };
    Model.prototype.ensureIndices = function (callback) {
        var _this = this;
        return Promise.resolve(this.options.indices).map(function (index) {
            return _this.ensureIndex(index.spec || index, index.options || {});
        }).nodeify(callback);
    };
    Model.prototype.dropIndex = function (specification, callback) {
        var _this = this;
        var index;
        if (typeof (specification) === 'string')
            index = specification;
        else {
            index = _(specification).map(function (direction, key) { return key + '_' + direction; }).reduce(function (x, y) { return x + '_' + y; }, '');
        }
        return new Promise(function (resolve, reject) {
            _this.collection.dropIndex(index, function (err, count) {
                if (err)
                    return reject(err);
                return resolve(count);
            });
        }).nodeify(callback);
    };
    Model.prototype.dropIndexes = function (callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.collection.dropAllIndexes(function (err, count) {
                if (err)
                    return reject(err);
                return resolve(count);
            });
        }).nodeify(callback);
    };
    return Model;
})();
exports.Model = Model;
var ModelSpecificInstance = (function () {
    function ModelSpecificInstance(model, instanceConstructor) {
        var _this = this;
        this.Constructor = function (document, isNew, isPartial) {
            instanceConstructor.call(this, model, document, isNew, isPartial);
        };
        util.inherits(this.Constructor, instanceConstructor);
        _.each(model.schema, function (property, key) {
            Object.defineProperty(_this.Constructor.prototype, key, {
                get: function () {
                    return this._modified[key];
                },
                set: function (value) {
                    this._modified[key] = value;
                },
                enumerable: true
            });
        });
    }
    ModelSpecificInstance.prototype.build = function (document, isNew, isPartial) {
        return new this.Constructor(document, isNew, isPartial);
    };
    return ModelSpecificInstance;
})();
exports.ModelSpecificInstance = ModelSpecificInstance;
var ModelHelpers = (function () {
    function ModelHelpers(model) {
        this._model = model;
        this._validator = new Skmatc(model.schema);
        this._transform = new Concoction(model.options.transforms);
    }
    Object.defineProperty(ModelHelpers.prototype, "transform", {
        /**
         * Gets the Concoction transforms defined for this model
         * @returns {Concoction}
         */
        get: function () {
            return this._transform;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Validates a document to ensure that it matches the model's ISchema requirements
     * @param {any} document The document to validate against the ISchema
     * @returns {SkmatcCore.IResult} The result of the validation
     */
    ModelHelpers.prototype.validate = function (document) {
        return this._validator.validate(document);
    };
    /**
     * Creates a selector based on the document's unique _id field
     * @param {object} document The document to render the unique selector for
     * @returns {{_id: any}} A database selector which can be used to return only this document
     */
    ModelHelpers.prototype.selectOne = function (document) {
        var testDoc = _.cloneDeep(document);
        this.transform.reverse(testDoc);
        return {
            _id: testDoc._id
        };
    };
    Object.defineProperty(ModelHelpers.prototype, "identifierField", {
        /**
         * Gets the field used in the ISchema to represent the document _id
         */
        get: function () {
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
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates a selector based on the document's unique _id field in downstream format
     * @param {any} id The downstream identifier to use when creating the selector
     * @returns {object} A database selector which can be used to return only this document in downstream form
     */
    ModelHelpers.prototype.selectOneDownstream = function (id) {
        var conditions = {};
        conditions[this.identifierField] = id;
        return conditions;
    };
    /**
     * Wraps the given document in an instance wrapper for use throughout the application
     * @param {any} document The document to be wrapped as an instance
     * @param {Boolean} isNew Whether the instance originated from the database or was created by the application
     * @param {Boolean} isPartial Whether the document supplied contains all information present in the database
     * @returns {any} An instance which wraps this document
     */
    ModelHelpers.prototype.wrapDocument = function (document, isNew, isPartial) {
        return this._model.wrap(document, isNew, isPartial);
    };
    /**
     * Performs a diff operation between two documents and creates a MongoDB changes object to represent the differences
     * @param {any} original The original document prior to changes being made
     * @param {any} modified The document after changes were made
     */
    ModelHelpers.prototype.diff = function (original, modified) {
        var omnom = new Omnom();
        omnom.diff(original, modified);
        return omnom.changes;
    };
    return ModelHelpers;
})();
exports.ModelHelpers = ModelHelpers;
var ModelHandlers = (function () {
    function ModelHandlers(model) {
        this._model = model;
    }
    Object.defineProperty(ModelHandlers.prototype, "model", {
        get: function () {
            return this._model;
        },
        enumerable: true,
        configurable: true
    });
    ModelHandlers.prototype.documentsReceived = function (conditions, results, wrapper, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        _.defaults(options, {
            cache: true,
            partial: false
        });
        return Promise.resolve(results).map(function (target) {
            return Promise.resolve().then(function () {
                // Trigger the received hook
                if (_this.model.options.hooks.retrieved)
                    return _this.model.options.hooks.retrieved(target);
            }).then(function () {
                // Cache the document if caching is enabled
                if (_this.model.core.cache && options.cache && !options.fields) {
                    var cacheDoc = _.cloneDeep(target);
                    return _this.model.cache.set(conditions, cacheDoc);
                }
            }).then(function () {
                // Transform the document
                _this.model.helpers.transform.apply(target);
                // Wrap the document and trigger the ready hook
                var wrapped = wrapper(target, false, !!options.fields);
                if (_this.model.options.hooks.ready)
                    return Promise.resolve(_this.model.options.hooks.ready(wrapped)).then(function () { return wrapped; });
                return wrapped;
            });
        });
    };
    ModelHandlers.prototype.creatingDocuments = function (documents) {
        var _this = this;
        return Promise.all(documents.map(function (document) {
            return Promise.resolve().then(function () {
                if (_this.model.options.hooks.retrieved)
                    return _this.model.options.hooks.creating(document);
            }).then(function () {
                var validation = _this.model.helpers.validate(document);
                if (validation.failed)
                    return Promise.reject(validation.error);
                _this.model.helpers.transform.reverse(document);
                return document;
            });
        }));
    };
    ModelHandlers.prototype.savingDocument = function (instance, changes) {
        var _this = this;
        return Promise.resolve().then(function () {
            if (_this.model.options.hooks.saving)
                return _this.model.options.hooks.saving(instance, changes);
        }).then(function () { return instance; });
    };
    return ModelHandlers;
})();
exports.ModelHandlers = ModelHandlers;
var ModelCache = (function () {
    function ModelCache(model) {
        this._model = model;
    }
    Object.defineProperty(ModelCache.prototype, "model", {
        get: function () {
            return this._model;
        },
        enumerable: true,
        configurable: true
    });
    ModelCache.prototype.set = function (conditions, value) {
        if (!this.model.cacheDirector || !this.model.cacheDirector.valid(conditions))
            return Promise.resolve(value);
        return this.model.core.cache.set(this.model.cacheDirector.buildKey(conditions), value);
    };
    ModelCache.prototype.get = function (conditions) {
        if (!this.model.cacheDirector || !this.model.cacheDirector.valid(conditions))
            return Promise.resolve(null);
        return this.model.core.cache.get(this.model.cacheDirector.buildKey(conditions));
    };
    ModelCache.prototype.clear = function (conditions) {
        if (!this.model.cacheDirector || !this.model.cacheDirector.valid(conditions))
            return Promise.resolve(false);
        return this.model.core.cache.clear(this.model.cacheDirector.buildKey(conditions));
    };
    return ModelCache;
})();
//# sourceMappingURL=Model.js.map