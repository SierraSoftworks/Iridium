var _ = require('lodash'),
    async = require('async'),
    debug = require('debug')('iridium:Model'),
    ObjectID = require('mongodb').ObjectID,
    EventEmitter = require('events').EventEmitter,
    Concoction = require('concoction'),
    skmatc = require('skmatc'),
    fn = require('functionality'),
    Promise = require('bluebird'),

    inherit = require('./utils/Inherit.js'),
    Database = require('./Database.js'),
    Instance = require('./Instance.js'),
    NoOpCache = require('./caches/NoOpCache.js');

// Fix for IntelliSense support in Node.js Tools for Visual Studio
(require.modules || {}).IridiumModel = module.exports = IridiumModel;

function IridiumModel(database, collection, schema, options) {
    /// <summary>Creates a new model around the specified database</summary>
    /// <param name="database" type="Database">The database wrapper on which this model will operate</param>
    /// <param name="collection" type="String">The name of the database collection in which objects of this type are stored</param>
    /// <param name="schema" type="Object">A JSON representation of the database schema</param>
    /// <param name="options" type="Object">Additional options configuring the behaviour of this model's instances</param>

    if(!(this instanceof IridiumModel)) return new IridiumModel(database, collection, schema, options);

    EventEmitter.call(this);

    // Don't throw exceptions which are sent via the 'error' event
    this.on('error', function(err) {
        debug('error: %s', err.message);
    });

    if (!options) options = {};

    _.defaults(options, {
        hooks: {},
        preprocessors: [
            new Concoction.Rename({
                _id: 'id'
            }),
            new Concoction.Convert({
                id: {
                    apply: function (value) { return (value && value.id) ? new ObjectID(value.id).toHexString() : value; },
                    reverse: function (value) { 
                            if(value === null || value === undefined) return undefined;
                            if(value && /^[a-f0-9]{24}$/.test(value)) return ObjectID.createFromHexString(value);
                            return value;
                        }
                }
            })
        ]
    });

    Object.defineProperty(this, 'preprocessor', {
        value: new Concoction(options.preprocessors)
    });

    Object.defineProperty(this, 'collection', {
        get: function () {
            var actualCollection = database.db.collection(collection);
            return Promise.promisifyAll(actualCollection, actualCollection);
        },
        set: function(value) { collection = value; },
        enumerable: false
    });

    Object.defineProperty(this, 'database', {
        get: function() { return database; },
        set: function(value) { database = value; },
        enumerable: false
    });

    Object.defineProperty(this, 'schema', {
        get: function() { return schema; },
        enumerable: false
    });
    
    var schemaValidator = new skmatc(schema);
    Object.defineProperty(this, 'schemaValidator', {
        get: function() { return schemaValidator; },
        enumerable: false
    });

    Object.defineProperty(this, 'options', {
        get: function () { return options; },
        enumerable: false
    });

    Object.defineProperty(this, 'isModel', {
        value: true,
        enumerable: false
    });

    var _instance = null;
    Object.defineProperty(this, 'Instance', {
        get: function () { return _instance = _instance || Instance.forModel(this); },
        enumerable: false
    });

    var _cache = options.cache;
    Object.defineProperty(this, 'cache', {
        get: function () { return _cache = _cache || new NoOpCache(); },
        enumerable: false
    });


    var i;
    for(i = 0; i < database.plugins.length; i++) {
        if(database.plugins[i].validate) {
            var validators = database.plugins[i].validate;

            if(Array.isArray(validators))
                _.forEach(validators, function(validator) { this.schemaValidator.register(validator); }, this);
            else
                this.schemaValidator.register(validators);
        }
    }

    for(i = 0; i < database.plugins.length; i++) {
        if(database.plugins[i].newModel) database.plugins[i].newModel.call(this, database, collection, schema, options);
    }
}

inherit(IridiumModel, EventEmitter);


IridiumModel.prototype.fromSource = function(document) {
    /// <summary>Applies the model's preprocessors to convert the document from the source</summary>
    /// <param name="document" type="Object">The object to apply the preprocessors to</param>

    this.preprocessor.apply(document);
};


IridiumModel.prototype.toSource = function(document) {
    /// <summary>Applies the model's preprocessors to convert the document from the source</summary>
    /// <param name="document" type="Object">The object to apply the preprocessors to</param>

    this.preprocessor.reverse(document);
};


IridiumModel.prototype.uniqueConditions = function(document) {
    /// <summary>Gets a set of MongoDB conditions which uniquely identify the given document for this model in source form/summary>
    /// <param name="document" type="Object">The document to find the unique conditions for</param>
    /// <returns type="Object"/>

    var testDoc = _.cloneDeep(document);
    this.toSource(testDoc);

    var conditions = {
        _id: testDoc._id
    };
    return conditions;
};


IridiumModel.prototype.downstreamID = function(id) {
    /// <signature>
    /// <summary>Gets the downstream _id field's identifier after preprocessing</summary>
    /// <returns type="String"/>
    /// </signature>
    /// <signature>
    /// <summary>Gets the set of conditions representing the downstream _id field for the given downstream identifier</summary>
    /// <param name="id" type="Mixed">The identifier to create the conditions from</param>
    /// <returns type="Object"/>
    /// </signature>

    var test_doc = {
        _id: true
    };

    this.fromSource(test_doc);

    var _id = null;
    for(var k in test_doc)
        if(test_doc[k] === true) {
            _id = k;
            break;
        }
    
    if(id) {
        var conditions = {};
        conditions[_id] = id;
        return conditions;
    } else return _id;
};


IridiumModel.prototype.wrap = function (document, isNew, isPartial) {
    /// <signature>
    /// <summary>Wraps the given database object in this model's Instance wrapper</summary>
    /// <param name="document" type="Object">The database object to be wrapped by this model</param>
    /// <returns value="new this.Instance(document, isNew)"/>
    /// </signature>
    /// <signature>
    /// <summary>Wraps the given database object in this model's Instance wrapper</summary>
    /// <param name="document" type="Object">The database object to be wrapped by this model</param>
    /// <param name="isNew" type="Boolean">Whether or not this instance is new (not in the database)</param>
    /// <returns value="new this.Instance(document, isNew)"/>
    /// </signature>
    /// <signature>
    /// <summary>Wraps the given database object in this model's Instance wrapper</summary>
    /// <param name="document" type="Object">The database object to be wrapped by this model</param>
    /// <param name="isNew" type="Boolean">Whether or not this instance is new (not in the database)</param>
    /// <param name="isPartial" type="Boolean">Whether or not this instance is only a partial representation of the database version</param>
    /// <returns value="new this.Instance(document, isNew, isPartial)"/>
    /// </signature>
    
    return new this.Instance(document, isNew, isPartial);
};


IridiumModel.prototype.onRetrieved = function(conditions, results, wrapper, options) {
    ///<signature>
    ///<summary>Handles any post-receive hooks and the wrapping of objects from the database</summary>
    ///<param name="conditions" type="Object">The conditions which resulted in the object being retrieved</param>
    ///<param name="results" type="Array" elementType="Object">The objects retrieved from the database</param>
    ///<param name="callback" value="(function(err, objects) { })">The function to be called once the objects have been wrapped</param>
    ///<param name="wrapper" value="Model.prototype.wrap" optional="true">A function which converts the retrieved objects prior to submission</param>
    ///<param name="options" type="Object" optional="true">A set of options determining how to handle the retrieved object</param>
    ///</signature>
    ///<signature>
    ///<summary>Handles any post-receive hooks and the wrapping of objects from the database</summary>
    ///<param name="conditions" type="Object">The conditions which resulted in the object being retrieved</param>
    ///<param name="results" type="Array" elementType="Object">The objects retrieved from the database</param>
    ///<param name="callback" value="(function(err, objects) { })">The function to be called once the objects have been wrapped</param>
    ///<param name="wrapper" value="Model.prototype.wrap" optional="true">A function which converts the retrieved objects prior to submission</param>
    ///<param name="options" type="Object" optional="true">A set of options determining how to handle the retrieved object</param>
    ///</signature>

    var $ = this;

    wrapper = wrapper || this.wrap.bind(this);
    options = options || {};

    _.defaults(options, {
        wrap: true,
        cache: true,
        partial: false
    });

    var returnArray = Array.isArray(results);
    if(!returnArray) results = [results];

    function doHook(hook, target) {
        return Promise.resolve().then(function() {
            if(!hook) return;
            if(hook.length === 0) return hook.call(target);
            return Promise.fromNode(hook.bind(target));
        });
    }

    return Promise.bind(this, results).map(function(target) {
        return doHook(this.options.hooks.retrieved, target).bind(this).then(function() {
            this.emit('retrieved', target);
        }).then(function() {
            if(this.cache && options.cache && !options.partial) {
                var cacheDoc = _.cloneDeep(target);
                this.cache.store(conditions, cacheDoc, function() { });
            }
        }).then(function() {
            var wrapped = target;
            if(options.wrap) wrapped = wrapper(target, false, options.partial);
            else this.fromSource(wrapped);

            return doHook(this.options.hooks.ready, wrapped).then(function() {
                return wrapped;
            });
        });
    }).then(function(results) {
        if(returnArray) return results;
        return results[0];
    });
};

IridiumModel.prototype.onCreating = function(documents) {
    ///<signature>
    ///<summary>Handles any pre-creation hooks for the model</summary>
    ///<param name="document" type="Array" elementType="Object">The documents being created - prior to any transformations being applied</param>
    ///</signature>

    function doHook(hook, target) {
        return Promise.resolve(target).then(function(target) {
            if(!hook) return;
            if(!hook.length) return hook.call(target);
            return Promise.fromNode(hook.bind(target));
        });
    }

    return Promise.resolve(documents).bind(this).map(function(document) {
        this.emit('creating', document);
        return doHook(this.options.hooks.creating || this.options.hooks.beforeCreate, document).bind(this).then(function() {
            var validation = this.schemaValidator.validate(document);
            if(validation.failed) throw validation.error;
            this.toSource(document);
            return document;
        });
    });
};

IridiumModel.prototype.onSaving = function(instance, changes) {
    /// <signature>
    /// <summary>Handles any pre-save hooks for the model</summary>
    /// <param name="instance" value="this.Instance">The instance being saved to the database</param>
    /// <param name="changes" value="Object">The MongoDB changes object being applied to the database document</param>
    /// </signature>
    
    function doHook(hook, target, arg) {
        return Promise.resolve().then(function() {
            if(!hook) return;
            if(hook.length === 0) return hook.call(target, arg);
            return Promise.fromNode(hook.bind(target, arg));
        });
    }

    return doHook(this.options.hooks.saving, instance, changes).bind(this).then(function() {
        this.emit('saving', instance, changes);
    }).error(function(err) {
        this.emit('error', err);
    });
};


/**
 * Finds a number of documents in the collection which match the given criteria.
 *
 * find([conditions, [options]], [callback]) : promise
 * 
 * `conditions` may be either a well-formed object representing the query passed
 * to MongoDB or a value which can be coerced into an `{ _id: '' }` selector through
 * the transforms engine.
 *
 * `options` allows you to specify different options including the following:
 * ```
 * {
 *   wrap: true, // Whether to wrap results in Iridium Instances
 *   cache: true, // Whether to attempt to retrieve the document from the cache
 *   skip: 0, // The number of documents to skip
 *   limit: 1, // The maximum number of documents to return
 *   sort: { _id: 1 }, // The sort order to use for documents
 *   fields: { _id: 1 }, // The fields to return (or exclude) from the document (disables cache storage)
 * }
 * ```
 *
 * `callback` is optional and should be of the form `function (err, result) {}`
 */
IridiumModel.prototype.find = fn.first(function() {
    this.promise = Promise.resolve().bind(this);
})
.on(fn.not(Object), fn.gobble(), function(id) {
    this.args[0] = this.context.downstreamID(id);
    this.retry();
})
.on(fn.opt(Function), function(callback) {
    this.conditions = {};
    this.options = { wrap: true, cache: true };
    this.callback = callback;
}).on(Object, fn.opt(Function), function(conditions, callback) {
    this.conditions = conditions;
    this.options = { wrap: true };
    this.callback = callback;
}).on(Object, Object, fn.opt(Function), function(conditions, options, callback) {
    this.conditions = conditions;
    this.options = options;
    this.callback = callback;

    _.defaults(this.options, {
        wrap: true
    });
}).then(function() {
    return this.promise.then(function() {
        if(this.options.fields)
            this.context.toSource(this.options.fields);

        if (!_.isPlainObject(this.conditions)) this.conditions = this.context.downstreamID(this.conditions);
        this.context.toSource(this.conditions);

        var cursor = this.context.collection.find(this.conditions, { limit: this.options.limit, sort: this.options.sort, skip: this.options.skip, fields: this.options.fields });
        cursor = Promise.promisifyAll(cursor);

        return cursor.toArrayAsync().bind(this).then(function(results) {
            if(!results || !results.length) return [];
            return this.context.onRetrieved(this.conditions, results, null, { wrap: this.options.wrap, cache: false, partial: !!this.options.fields });
        });
    }).error(function(err) {
        this.context.emit('error', err);
        return Promise.reject(err);
    }).nodeify(this.callback);
}).compile();


/**
 * Finds a single document in the collection which matches the given criteria.
 *
 * findOne([conditions, [options]], [callback]) : promise
 * 
 * `conditions` may be either a well-formed object representing the query passed
 * to MongoDB or a value which can be coerced into an `{ _id: '' }` selector through
 * the transforms engine.
 *
 * `options` allows you to specify different options including the following:
 * ```
 * {
 *   wrap: true, // Whether to wrap results in Iridium Instances
 *   cache: true, // Whether to attempt to retrieve the document from the cache
 *   skip: 0, // The number of documents to skip
 *   sort: { _id: 1 }, // The sort order to use for documents
 *   fields: { _id: 1 }, // The fields to return (or exclude) from the document (disables cache storage)
 * }
 * ```
 *
 * `callback` is optional and should be of the form `function (err, result) {}`
 */
IridiumModel.prototype.findOne = IridiumModel.prototype.get = fn.first(function() {
    this.promise = Promise.resolve().bind(this);
    this.cacheFetch = Promise.promisify(this.context.cache.fetch, this.context.cache);
})
.on(fn.not(Object), fn.gobble(), function(id) {
    this.args[0] = this.context.downstreamID(id);
    this.retry();
})
.on(fn.opt(Function), function(callback) {
    this.conditions = {};
    this.options = { wrap: true, cache: true };
    this.callback = callback;
})
.on(Object, fn.opt(Function), function(conditions, callback) {
    this.conditions = conditions;
    this.options = { wrap: true, cache: true };
    this.callback = callback;
})
.on(Object, Object, fn.opt(Function), function(conditions, options, callback) {
    this.conditions = conditions;
    this.options = options;
    this.callback = callback;

    _.defaults(this.options, {
        wrap: true,
        cache: true
    });
}).then(function() {
    return this.promise.then(function() {
        this.context.toSource(this.conditions);

        if(this.options.fields)
            this.context.toSource(this.options.fields);

        if(this.options.cache && this.context.cache && this.context.cache.valid(this.conditions))
            return this.cacheFetch(this.conditions).bind(this).then(function(doc) {
                if(doc) return Promise.resolve(doc);
                else return Promise.reject(null);
            });
        return Promise.reject(null);
    }).catch(function() {
        return this.context.collection.findOneAsync(this.conditions, { sort: this.options.sort, skip: this.options.skip, fields: this.options.fields }).bind(this);
    }).then(function(doc) {
        if(!doc) return null;
        return this.context.onRetrieved(this.conditions, doc, null, { wrap: this.options.wrap, cache: this.options.cache, partial: !!this.options.fields }).bind(this);
    }).catch(function(err) {
        this.context.emit('error', err);
        return Promise.reject(err);
    }).nodeify(this.callback);
}).compile();


IridiumModel.prototype.insert = IridiumModel.prototype.create = fn.first(function() {
    this.promise = Promise.bind(this);
})
.on(Object, fn.gobble(), function(object) {
    this.returnArray = false;
    this.args[0] = [object];
    this.retry();
})
.on([Object], fn.opt(Function), function(objects, callback) {
    this.objects = objects;
    this.returnArray = this.returnArray === undefined ? true : this.returnArray;
    this.options = {
        wrap: true,
        w: 1
    };
    this.callback = callback;
})
.on([Object], Object, fn.opt(Function), function(objects, options, callback) {
    this.objects = objects;
    this.options = options;
    this.returnArray = this.returnArray === undefined ? true : this.returnArray;
    this.callback = callback;

     _.defaults(this.options, {
        wrap: true,
        w: 1
    });
}).then(function() {
    return this.promise.then(function() {
        var queryOptions = { w: this.options.w, upsert: !!this.options.upsert, new: true };
        var objects = this.context.onCreating(this.objects).bind(this);
        var inserted;
        if(queryOptions.upsert)
            inserted = objects.map(function(object) {
                return this.context.collection.findAndModifyAsync({ _id: object._id }, { _id: 1 }, object, queryOptions).then(function(result) { return result[0]; }).bind(this);
            });
        else
            inserted = objects.then(function(resolvedObjects) {
                return this.context.collection.insertAsync(resolvedObjects, queryOptions).bind(this);
            });

        return inserted;
    }).then(function(inserted) {
        return this.context.onRetrieved(null, inserted, null, { wrap: this.options.wrap, cache: this.options.cache }).bind(this);
    }).then(function(results) {
        if(!Array.isArray(results)) results = [results];
        if(!this.returnArray) return results[0];
        return results;
    }).catch(function(err) {
        this.context.emit('error', err);
        return Promise.reject(err);
    }).nodeify(this.callback);
}).compile();


IridiumModel.prototype.update = fn.first(function() {
    this.promise = Promise.resolve().bind(this);
}).on(Object, Object, fn.opt(Function), function(conditions, changes, callback) {
    this.conditions = conditions;
    this.changes = changes;
    this.options = {
        w: 1,
        multi: true
    };
    this.callback = callback;
}).on(Object, Object, Object, fn.opt(Function), function(conditions, changes, options, callback) {
    this.conditions = conditions;
    this.changes = changes;
    this.options = options;

    _.defaults(this.options, {
        w: 1,
        multi: true
    });
    this.callback = callback;
}).then(function() {
    this.context.toSource(this.conditions);

    return this.promise.then(function() {
        return this.context.collection.updateAsync(this.conditions, this.changes, this.options).bind(this);
    }).catch(function(err) {
        this.context.emit('error', err);
        return Promise.reject(err);
    }).nodeify(this.callback);
}).compile();


IridiumModel.prototype.count = fn.first(function() {
    this.promise = Promise.resolve().bind(this);
}).on(fn.not(Object), fn.gobble(), function(conditions, callback) {
    this.args[0] = this.context.downstreamID(id);
    this.retry();
}).on(fn.opt(Function), function(callback) {
    this.conditions = {};
    this.callback = callback;
}).on(Object, fn.opt(Function), function(conditions, callback) {
    this.conditions = conditions;
    this.callback = callback;
}).then(function() {
    this.context.toSource(this.conditions);

    return this.promise.then(function() {
        return this.context.collection.countAsync(this.conditions);
    }).catch(function(err) {
        this.context.emit('error', err);
        return Promise.reject(err);
    }).nodeify(this.callback);
}).compile();


IridiumModel.prototype.remove = fn.first(function() {
    this.promise = Promise.resolve().bind(this);
    this.cacheDrop = Promise.promisify(this.context.cache.drop, this.context.cache);
}).on(fn.not(Object), fn.gobble(), function(conditions, callback) {
    this.args[0] = this.context.downstreamID(id);
    this.retry();
}).on(fn.opt(Function), function(callback) {
    this.conditions = {};
    this.options = {
        w: 1
    };
    this.callback = callback;
}).on(Object, fn.opt(Function), function(conditions, callback) {
    this.conditions = conditions;
    this.options = {
        w: 1
    };
    this.callback = callback;
}).on(Object, Object, fn.opt(Function), function(conditions, options, callback) {
    this.conditions = conditions;
    this.options = options;
    _.defaults(this.options, {
        w: 1
    });
    this.callback = callback;
}).then(function() {
    this.context.toSource(this.conditions);

    return this.promise.then(function() {
        return this.context.collection.removeAsync(this.conditions, this.options);
    }).then(function(count) {
        if(this.context.cache && this.context.cache.valid(this.conditions)) 
            return this.cacheDrop(this.conditions).then(function() { return count; });
        return count;
    }).catch(function(err) {
        this.context.emit('error', err);
        return Promise.reject(err);
    }).nodeify(this.callback);
}).compile();


IridiumModel.prototype.aggregate = function (chain, callback) {
    /// <signature>
    /// <summary>Allows you to execute aggregation queries using MongoDB's aggregation framework</summary>
    /// <param name="chain" type="Array" elementType="Object">The aggregation toolchain to run</param>
    /// <param name="callback" type="Function" optional="true">A function to be called once aggregation has been completed</param>
    /// </signature>

    return this.collection.aggregateAsync(chain).nodeify(callback);
};


IridiumModel.prototype.ensureIndex = fn.first(function() {
}).on(Object, fn.opt(Function), function(spec, callback) {
    return this.collection.ensureIndexAsync(spec, {}).nodeify(callback);
}).on(Object, Object, fn.opt(Function), function(spec, options, callback) {
    return this.collection.ensureIndexAsync(spec, options).nodeify(callback);
}).compile();


IridiumModel.prototype.setupIndexes = function (callback) {
    /// <signature>
    /// <summary>Configures indexes defined for this model</summary>
    /// </signature>
    /// <signature>
    /// <summary>Configures indexes defined for this model</summary>
    /// <param name="callback" type="Function">A function to be called once all index creations have been requested</param>
    /// </signature>

    var $ = this;

    if (!this.options.indexes || this.options.indexes.length === 0) return Promise.resolve([]);

    return Promise.bind(this, this.options.indexes).map(function(index) {
        return this.ensureIndex(index[0], index[1]);
    });
};


/**
 * INTELLISENSE STUFF
 */

function Model_InstanceCallback_Single(err, instance) {
    /// <summary>A function that is executed upon insertion of a single document</summary>
    /// <param name="err" type="Error" mayBeNull="true">An error object representing a problem inserting the document</param>
    /// <param name="instance" type="Instance">The document which was inserted into the database</param>
}

function Model_InstanceCallback_Multiple(err, instances) {
    /// <summary>A function that is executed upon insertion of multiple documents</summary>
    /// <param name="err" type="Error" mayBeNull="true">An error object representing a problem inserting the documents</param>
    /// <param name="instances" type="Array" elementType="Instance">The documents which were inserted into the database</param>
}