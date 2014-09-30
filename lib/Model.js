var _ = require('lodash'),
    async = require('async-q'),
    debug = require('debug')('iridium:Model'),
    ObjectID = require('mongodb').ObjectID,
    EventEmitter = require('events').EventEmitter,
    Concoction = require('concoction'),
    skmatc = require('skmatc'),
    fn = require('functionality'),
    Q = require('q'),

    inherit = require('./utils/Inherit.js'),
    Database = require('./Database.js'),
    Instance = require('./Instance.js'),
    NoOpCache = require('./caches/NoOpCache.js');
Q.longStackSupport = true;

(require.modules || {}).Model = module.exports = Model;

function Model(database, collection, schema, options) {
    /// <summary>Creates a new model around the specified database</summary>
    /// <param name="database" type="Database">The database wrapper on which this model will operate</param>
    /// <param name="collection" type="String">The name of the database collection in which objects of this type are stored</param>
    /// <param name="schema" type="Object">A JSON representation of the database schema</param>
    /// <param name="options" type="Object">Additional options configuring the behaviour of this model's instances</param>

    if(!(this instanceof Model)) return new Model(database, collection, schema, options);

    EventEmitter.call(this);
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
        get: function () { return database.db.collection(collection); },
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

inherit(Model, EventEmitter);


Model.prototype.fromSource = function(document) {
    /// <summary>Applies the model's preprocessors to convert the document from the source</summary>
    /// <param name="document" type="Object">The object to apply the preprocessors to</param>

    this.preprocessor.apply(document);
};


Model.prototype.toSource = function(document) {
    /// <summary>Applies the model's preprocessors to convert the document from the source</summary>
    /// <param name="document" type="Object">The object to apply the preprocessors to</param>

    this.preprocessor.reverse(document);
};


Model.prototype.uniqueConditions = function(document) {
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


Model.prototype.downstreamID = function(id) {
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


Model.prototype.wrap = function (document, isNew, isPartial) {
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


Model.prototype.onRetrieved = function(conditions, results, wrapper, options) {
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

    var deferred = Q.defer();

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
        if(!hook) return Q();
        
        if(hook.length === 0) {
            try {
                hook.call(target);
                return Q();
            } catch(err) {
                return Q.reject(err);
            }
        } else {
            var q = Q.defer();
            hook.call(target, function(err) {
                if(err) return q.reject(err);
                return q.resolve();
            });
            return q.promise;
        }
    }

    async.parallel(_.map(results, function(target) {
        return (function() {
            return doHook(this.options.hooks.retrieved, target).then((function() {
                this.emit('retrieved', target);
                return Q();
            }).bind(this)).then((function() {
                if(!options.cache || options.partial) return Q();
                
                var q = Q.defer();
                var cacheDoc = _.cloneDeep(target);

                this.cache.store(conditions, cacheDoc, function() {
                    q.resolve();
                });

                return q.promise;
            }).bind(this)).then((function() {
                var wrapped = target;

                if(options.wrap) wrapped = wrapper(target, false, options.partial);
                else this.fromSource(wrapped);

                return Q(wrapped);
            }).bind(this)).then((function(wrapped) {
                return doHook(this.options.hooks.ready, wrapped).then(function() { return Q(wrapped); });
            }).bind(this));
        }).bind(this);
    }, this)).then(function(output) {
        if(returnArray)
            return deferred.resolve(output);
        else
            return deferred.resolve(output[0]);
    }, (function(err) {
        this.emit('error', err);
        return deferred.reject(err);
    }).bind(this));

    return deferred.promise; 
};


Model.prototype.onCreating = function(document) {
    ///<signature>
    ///<summary>Handles any pre-creation hooks for the model</summary>
    ///<param name="document" type="Object">The document being created - prior to any transformations being applied</param>
    ///</signature>

    function doHook(hook, target, args) {
        if(!hook) return Q();
        if(hook.length === 0) {
            try {
                hook.apply(target, args);
                return Q();
            } catch(err) {
                return Q.reject(err);
            }
        } else {
            var q = Q.defer();
            args.push(function(err) {
                if(err) return q.reject(err);
                return q.resolve();
            });

            hook.apply(target, args);
            return q.promise;
        }
    }

    var sent = false;
    return doHook(this.options.hooks.creating || this.options.hooks.beforeCreate, document, []).then((function() {
        if(!sent) {
            sent = true;
            this.emit('creating', document);
        }
        return Q(document);
    }).bind(this), (function(err) {
        this.emit('error', err);
        return Q.reject(err);
    }).bind(this));
    
};


Model.prototype.onSaving = function(instance, changes) {
    /// <signature>
    /// <summary>Handles any pre-save hooks for the model</summary>
    /// <param name="instance" value="this.Instance">The instance being saved to the database</param>
    /// <param name="changes" value="Object">The MongoDB changes object being applied to the database document</param>
    /// </signature>
    
    function doHook(hook, target, args) {
        if(!hook) return Q();
        if(hook.length === 0) {
            try {
                hook.apply(target, args);
                return Q();
            } catch(err) {
                return Q.reject(err);
            }
        } else {
            var q = Q.defer();

            args.push(function(err) {
                if(err) q.reject(err);
                q.resolve();
            });
            hook.apply(target, args);

            return q.promise;
        }
    }

    return doHook(this.options.hooks.saving, instance, [changes]).then((function() {
        this.emit('saving', instance, changes);
        return Q.resolve();
    }).bind(this)).fail((function(err) {
        this.emit('error', err);
        return Q.reject(err);
    }).bind(this));
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
Model.prototype.find = fn.first(function() {
    this.deferred = Q.defer();
})
.on(fn.not(Object), fn.gobble(), function(id) {
    this.args[0] = this.context.downstreamID(id);
    this.retry();
})
.on(fn.opt(Function), function(callback) {
    this.conditions = {};
    this.options = { wrap: true, cache: true };
    
    if(callback) promiseCallback(this.deferred.promise, callback);
}).on(Object, fn.opt(Function), function(conditions, callback) {
    this.conditions = conditions;
    this.options = { wrap: true };

    if(callback) promiseCallback(this.deferred.promise, callback);
}).on(Object, Object, fn.opt(Function), function(conditions, options, callback) {
    this.conditions = conditions;
    this.options = options;

    _.defaults(this.options, {
        wrap: true
    });

    if(callback) promiseCallback(this.deferred.promise, callback);
}).then(function() {
    if(this.options.fields)
        this.context.toSource(this.options.fields);

    if (!_.isPlainObject(this.conditions)) this.conditions = this.context.downstreamID(this.conditions);
    this.context.toSource(this.conditions);

    var cursor = this.context.collection.find(this.conditions, { limit: this.options.limit, sort: this.options.sort, skip: this.options.skip, fields: this.options.fields });

    var getResults = Q.nbind(cursor.toArray, cursor);

    promisePipe(getResults().then((function(results) {
        if(!results || !results.length) return Q([]);
        return this.context.onRetrieved(this.conditions, results, null, { wrap: this.options.wrap, cache: false, partial: !!this.options.fields });
    }).bind(this)).fail((function(err) {
        this.context.emit('error', err);
        Q.reject(err);
    }).bind(this)), this.deferred);

    return this.deferred.promise;
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
Model.prototype.findOne = Model.prototype.get = fn.first(function() {
    this.deferred = Q.defer();
})
.on(fn.not(Object), fn.gobble(), function(id) {
    this.args[0] = this.context.downstreamID(id);
    this.retry();
})
.on(fn.opt(Function), function(callback) {
    this.conditions = {};
    this.options = { wrap: true, cache: true };

    if(callback) promiseCallback(this.deferred.promise, callback);
})
.on(Object, fn.opt(Function), function(conditions, callback) {
    this.conditions = conditions;
    this.options = { wrap: true, cache: true };

    if(callback) promiseCallback(this.deferred.promise, callback);
})
.on(Object, Object, fn.opt(Function), function(conditions, options, callback) {
    this.conditions = conditions;
    this.options = options;

    _.defaults(this.options, {
        wrap: true,
        cache: true
    });

    if(callback) promiseCallback(this.deferred.promise, callback);
}).then(function() {
    promisePipe(Q()

    .then((function() {
        this.context.toSource(this.conditions);
        if(this.options.fields)
            this.context.toSource(this.options.fields);
        return Q(this.conditions);
    }).bind(this))

    .then((function() {
        var deferred = Q.defer();

        if(this.options.cache && this.context.cache && this.context.cache.valid(this.conditions))
            return Q.nbind(this.context.cache.fetch, this.context.cache)(this.conditions).then(function(doc) { if(doc) return Q(doc); return Q.reject(null); });
        else return Q.reject();

        return deferred.promise;
    }).bind(this))

    .then((function(doc) {
        return this.context.onRetrieved(this.conditions, doc, null, { wrap: this.options.wrap, cache: this.options.cache, partial: !!this.options.fields });
    }).bind(this), (function(err) {
        var findOne = Q.nbind(this.context.collection.findOne, this.context.collection);

        return findOne(this.conditions, { sort: this.options.sort, skip: this.options.skip, fields: this.options.fields }).then((function(doc) {
            if(!doc) return Q(doc);
            return this.context.onRetrieved(this.conditions, doc, null, { wrap: this.options.wrap, cache: this.options.cache, partial: !!this.options.fields });
        }).bind(this));
    }).bind(this)), this.deferred);

    return this.deferred.promise;
}).compile();


Model.prototype.insert = Model.prototype.create = fn.first(function() {
    this.deferred = Q.defer();
})
.on(Object, fn.gobble(), function(object) {
    this.args[0] = [object];
    this.returnArray = false;
    this.retry();
})
.on([Object], fn.opt(Function), function(objects, callback) {
    this.objects = objects;
    this.returnArray = this.returnArray === undefined ? true : this.returnArray;
    this.options = {
        wrap: true,
        w: 1
    };

    if(callback) promiseCallback(this.deferred.promise, callback);
})
.on([Object], Object, fn.opt(Function), function(objects, options, callback) {
    this.objects = objects;
    this.options = options;
    this.returnArray = this.returnArray === undefined ? true : this.returnArray;

     _.defaults(this.options, {
        wrap: true,
        w: 1
    });
    
    if(callback) promiseCallback(this.deferred.promise, callback);
}).then(function() {
    var queryOptions = { w: this.options.w, upsert: !!this.options.upsert, new: true };

    promisePipe(async.series(_.map(this.objects, function(object) {
        return (function() {
            return this.context.onCreating(object).then((function(object) {
                var validation = this.context.schemaValidator.validate(object);
                if(validation.failed) return Q.reject(validation.error);
                return Q(object);
            }).bind(this)).then((function(object) {
                this.context.toSource(object);
                return Q(object);
            }).bind(this));
        }).bind(this);
    }, this)).then((function(objects) {
        if(queryOptions.upsert) return async.parallel(_.map(objects, function(object) {
            return (function() {
                return Q.nbind(this.context.collection.findAndModify, this.context.collection)({ _id: object._id }, { _id: 1 }, object, queryOptions).then(function(result) {
                    return Q(result[0]);
                });
            }).bind(this);
        }, this))
            ;
        else return Q.nbind(this.context.collection.insert, this.context.collection)(objects, queryOptions);
    }).bind(this)).then((function(inserted) {
        return this.context.onRetrieved(null, inserted, null, { wrap: this.options.wrap, cache: this.options.cache });
    }).bind(this)).then((function(results) {
        if(!Array.isArray(results)) results = [results];
        if(!this.returnArray) return Q(results[0]);
        return Q(results);
    }).bind(this), (function(err) {
        this.context.emit('error', err);
        return Q.reject(err);
    }).bind(this)), this.deferred);

    return this.deferred.promise;
}).compile();


Model.prototype.update = fn.first(function() {
    this.deferred = Q.defer();
}).on(Object, Object, fn.opt(Function), function(conditions, changes, callback) {
    this.conditions = conditions;
    this.changes = changes;
    this.options = {
        w: 1,
        multi: true
    };

    if(callback) promiseCallback(this.deferred.promise, callback);
}).on(Object, Object, Object, fn.opt(Function), function(conditions, changes, options, callback) {
    this.conditions = conditions;
    this.changes = changes;
    this.options = options;

    _.defaults(this.options, {
        w: 1,
        multi: true
    });

    if(callback) promiseCallback(this.deferred.promise, callback);
}).then(function() {
    this.context.toSource(this.conditions);

    var update = Q.nbind(this.context.collection.update, this.context.collection);

    promisePipe(update(this.conditions, this.changes, this.options).fail((function(err) {
        this.context.emit('error', err);
        Q.reject(err);
    }).bind(this)), this.deferred);

    return this.deferred.promise;
}).compile();


Model.prototype.count = fn.first(function() {
    this.deferred = Q.defer();
    this.count = Q.nbind(this.context.collection.count, this.context.collection);
}).on(fn.not(Object), fn.gobble(), function(conditions, callback) {
    this.args[0] = this.context.downstreamID(conditions);
    this.retry();
}).on(fn.opt(Function), function(callback) {
    this.conditions = {};
    if(callback) promiseCallback(this.deferred.promise, callback);
}).on(Object, fn.opt(Function), function(conditions, callback) {
    this.conditions = conditions;
    if(callback) promiseCallback(this.deferred.promise, callback);
}).then(function() {
    this.context.toSource(this.conditions);

    promisePipe(this.count(this.conditions).fail((function(err) {
        this.context.emit('error', err);
        Q.reject(err);
    }).bind(this)), this.deferred);

    return this.deferred.promise;
}).compile();


Model.prototype.remove = fn.first(function() {
    this.deferred = Q.defer();
    this.cacheDrop = Q.nbind(this.context.cache.drop, this.context.cache);
    this.remove = Q.nbind(this.context.collection.remove, this.context.collection);
}).on(fn.not(Object), fn.gobble(), function(conditions, callback) {
    this.args[0] = this.context.downstreamID(conditions);
    this.retry();
}).on(fn.opt(Function), function(callback) {
    this.conditions = {};
    this.options = {
        w: 1
    };

    if(callback) promiseCallback(this.deferred.promise, callback);
}).on(Object, fn.opt(Function), function(conditions, callback) {
    this.conditions = conditions;
    this.options = {
        w: 1
    };

    if(callback) promiseCallback(this.deferred.promise, callback);
}).on(Object, Object, fn.opt(Function), function(conditions, options, callback) {
    this.conditions = conditions;
    this.options = options;
    _.defaults(this.options, {
        w: 1
    });

    if(callback) promiseCallback(this.deferred.promise, callback);
}).then(function() {
    this.context.toSource(this.conditions);

    promisePipe(Q().then((function() {
        return this.remove(this.conditions, this.options);
    }).bind(this)).then((function(count) {
        if(this.context.cache && this.context.cache.valid(this.conditions)) 
            return this.cacheDrop(this.conditions).then(function() { return Q(count); });
        return Q(count);
    }).bind(this)).fail((function(err) {
        this.context.emit('error', err);
        Q.reject(err);
    }).bind(this)), this.deferred);

    return this.deferred.promise;
}).compile();


Model.prototype.aggregate = function () {
    /// <signature>
    /// <summary>Allows you to execute aggregation queries using MongoDB's aggregation framework</summary>
    /// <param name="chain" type="Array" elementType="Object">The aggregation toolchain to run</param>
    /// <param name="callback" type="Function">A function to be called once aggregation has been completed</param>
    /// </signature>
    
    this.collection.aggregate.apply(this.collection, arguments);
};


Model.prototype.ensureIndex = fn.first(function() {
    this.deferred = Q.defer();
    this.ensureIndex = Q.nbind(this.context.collection.ensureIndex, this.context.collection);
}).on(Object, fn.opt(Function), function(spec, callback) {
    if(callback) promiseCallback(this.deferred.promise, callback);

    promisePipe(this.ensureIndex(spec, {}), deferred);
    return this.deferred.promise;
}).on(Object, Object, fn.opt(Function), function(spec, options, callback) {
    if(callback) promiseCallback(this.deferred.promise, callback);

    promisePipe(this.ensureIndex(spec, options), deferred);
    return this.deferred.promise;
}).compile();


Model.prototype.setupIndexes = function (callback) {
    /// <signature>
    /// <summary>Configures indexes defined for this model</summary>
    /// </signature>
    /// <signature>
    /// <summary>Configures indexes defined for this model</summary>
    /// <param name="callback" type="Function">A function to be called once all index creations have been requested</param>
    /// </signature>

    var $ = this;

    callback = callback || function (err) {
        if (err) throw err;
    };

    if (!this.options.indexes || this.options.indexes.length === 0) return callback(null, []);

    var i = 0;
    var errors = [];
    var results = [];

    var next = function (err, result) {
        errors.push(err);
        results.push(result);

        if (++i === $.options.indexes.length) return callback(errors.length > 0 ? errors.pop() : null, results);
        $.ensureIndex($.options.indexes[i][0], $.options.indexes[i][1], next);
    };

    $.ensureIndex($.options.indexes[i][0], $.options.indexes[i][1], next);
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

/**
 * PROMISES STUFF
 */

function promisePipe(promise, deferred) {
    promise.then(function(result) {
        deferred.resolve(result);
    }, function(err) {
        deferred.reject(err);
    }, function(progress) {
        deferred.notify(progress);
    });
}

function promiseCallback(promise, callback) {
    promise.then(function(result) { callback(null, result); }, function(err) { callback(err); });
}