var _ = require('lodash'),
    async = require('async'),
    debug = require('debug')('iridium:Model'),
    ObjectID = require('mongodb').ObjectID,
    EventEmitter = require('events').EventEmitter,
    Concoction = require('concoction'),
    skmatc = require('skmatc'),

    inherit = require('./utils/Inherit.js'),
    Database = require('./Database.js'),
    Instance = require('./Instance.js'),
    NoOpCache = require('./caches/NoOpCache.js');

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
                    reverse: function (value) { return value ? ObjectID.createFromHexString(value) : undefined; }
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

Model.prototype.wrap = function (document, isNew) {
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
    
    return new this.Instance(document, isNew);
};

Model.prototype.onRetrieved = function(conditions, results, callback, wrapper, options) {
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
        cache: true
    });

    var returnArray = Array.isArray(results);
    if(!returnArray) results = [results];

    function doHook(hook, target, next) {
        if(!hook) return next();
        if(hook.length === 0) {
            try {
                hook.call(target);
                return next();
            } catch(err) {
                return next(err);
            }
        } else {
            hook.call(target, next);
        }
    }

    async.parallel(_.map(results, function(target) {
        return (function(done) {
            doHook(this.options.hooks.retrieved, target, (function(err) {
                if(err) {
                    this.emit('error', err);
                    return done(err);
                }
                this.emit('retrieved', target);

                var cacheDoc = _.cloneDeep(target);

                var wrapped = options.wrap ? wrapper(target) : this.fromSource(target);

                doHook(this.options.hooks.ready, wrapped, (function(err) {
                    if(err) {
                        this.emit('error', err);
                        return done(err);
                    }
                    this.emit('ready', wrapped);
                    if(options.cache)
                        return this.cache.store(conditions, cacheDoc, function() {
                            return done(null, wrapped);
                        });
                    else
                        return done(null, wrapped);
                }).bind(this));
            }).bind(this));
        }).bind(this);
    }, this), function(err, output) {
        if(err) return callback(err);
        if(returnArray)
            return callback(err, output);
        else
            return callback(err, output[0]);
    });
};

Model.prototype.onCreating = function(document, callback) {
    ///<signature>
    ///<summary>Handles any pre-creation hooks for the model</summary>
    ///<param name="document" type="Object">The document being created - prior to any transformations being applied</param>
    ///<param name="callback" value="(function(err) { })">The function to be called once the hooks have completed</param>
    ///</signature>

    function doHook(hook, target, args, next) {
        if(!hook) return next();
        if(hook.length === 0) {
            try {
                hook.apply(target, args);
                return next();
            } catch(err) {
                return next(err);
            }
        } else {
            args.push(next);
            hook.apply(target, args);
        }
    }

    var sent = false;
    doHook(this.options.hooks.creating || this.options.hooks.beforeCreate, document, [], (function(err) {
        if(sent) return; sent = true;

        if(err) this.emit('error', err);
        else this.emit('creating', document);

        return callback(err);
    }).bind(this));
};

Model.prototype.onSaving = function(instance, changes, callback) {
    /// <signature>
    /// <summary>Handles any pre-save hooks for the model</summary>
    /// <param name="instance" value="this.Instance">The instance being saved to the database</param>
    /// <param name="changes" value="Object">The MongoDB changes object being applied to the database document</param>
    /// <param name="callback" value="(function(err) { })">The function to be called once the hooks have completed</param>
    /// </signature>
    
    function doHook(hook, target, args, next) {
        if(!hook) return next();
        if(hook.length === 0) {
            try {
                hook.apply(target, args);
                return next();
            } catch(err) {
                return next(err);
            }
        } else {
            args.push(next);
            hook.apply(target, args);
        }
    }

    doHook(this.options.hooks.saving, instance, [changes], (function(err) {
        if(err) this.emit('error', err);
        else this.emit('saving', instance, changes);
        return callback(err);
    }).bind(this));
};

Model.prototype.find = function (conditions, options, callback) {
    /// <signature>
    /// <summary>Finds all occurences in the collection with an _id field matching the given conditions.</summary>
    /// <param name="conditions" type="Mixed" optional="true">The _id field of the object to locate</param>
    /// <param name="options" type="Object" optional="true">Options dictating how Iridium handles this request</param>
    /// <param name="callback" type="Function" value="Model_InstanceCallback_Multiple">A function to be called with the results once they have been retrieved.</param>
    /// </signature>
    /// <signature>
    /// <summary>Finds all occurences in the collection which match the given conditions.</summary>
    /// <param name="conditions" type="Object" optional="true">The conditions which will be used to select matches</param>
    /// <param name="options" type="Object" optional="true">Options dictating how Iridium handles this request</param>
    /// <param name="callback" type="Function" value="Model_InstanceCallback_Multiple">A function to be called with the results once they have been retrieved.</param>
    /// </signature>

    var args = Array.prototype.splice.call(arguments, 0);

    conditions = null;
    options = null;
    
    for(var i = 0; i < args.length; i++) {
        if('function' == typeof args[i])
            callback = args[i];
        else if(!conditions)
            conditions = args[i];
        else options = args[i];
    }

    conditions = conditions || {};
    options = options || {};
    _.defaults(options, {
        wrap: true
    });

    var $ = this;
    if (!_.isPlainObject(conditions)) conditions = this.downstreamID(conditions);
    this.toSource(conditions);

    this.collection.find(conditions).toArray((function (err, results) {
        if (err) {
            this.emit('error', err);
            return callback(err);
        }
        if (!results) return callback(null, null);
        return $.onRetrieved(conditions, results, callback, null, { wrap: options.wrap, cache: false });
    }).bind(this));
};

Model.prototype.findOne = Model.prototype.get = function (conditions, options, callback) {
    /// <signature>
    /// <summary>Finds the first occurence in the collection with an _id field matching the given conditions.</summary>
    /// <param name="conditions" type="Mixed" optional="true">The _id field of the object to locate</param>
    /// <param name="options" type="Object" optional="true">Options dictating how Iridium handles this request</param>
    /// <param name="callback" type="Function" value="Model_InstanceCallback_Single">A function to be called with the results once they have been retrieved.</param>
    /// </signature>
    /// <signature>
    /// <summary>Finds the first occurence in the collection which matches the given conditions.</summary>
    /// <param name="conditions" type="Object" optional="true">The conditions which will be used to select matches</param>
    /// <param name="options" type="Object" optional="true">Options dictating how Iridium handles this request</param>
    /// <param name="callback" type="Function" value="Model_InstanceCallback_Single">A function to be called with the results once they have been retrieved.</param>
    /// </signature>

    var args = Array.prototype.splice.call(arguments, 0);
    
    conditions = null;
    options = null;

    for(var i = 0; i < args.length; i++) {
        if('function' == typeof args[i])
            callback = args[i];
        else if(!conditions)
            conditions = args[i];
        else options = args[i];
    }

    conditions = conditions || {};
    options = options || {};
    _.defaults(options, {
        wrap: true,
        cache: true
    });

    if (!_.isPlainObject(conditions)) conditions = this.downstreamID(conditions);
    this.toSource(conditions);

    var fromDB = (function() {  
        this.collection.findOne(conditions, (function (err, results) {
            if (err) {
                this.emit('error', err);
                return callback(err);
            }
            if (!results) return callback(null, null);
            
            return this.onRetrieved(conditions, results, callback, null, { wrap: options.wrap, cache: options.cache });
        }).bind(this));
    }).bind(this);

    if(options.cache && this.cache && this.cache.valid(conditions))
        this.cache.fetch(conditions, (function(err, doc) {
            if(!err && doc)
                return this.onRetrieved(conditions, doc, callback, null, { wrap: options.wrap, cache: false });
            else
                return fromDB();
        }).bind(this));
    else
        return fromDB();
};

Model.prototype.insert = Model.prototype.create = function (object, options, callback) {
    /// <signature>
    /// <summary>Inserts the given object into the database</summary>
    /// <param name="object" type="Object">The properties to set on the newly created object</param>
    /// <param name="options" type="Object" optional="true">Options dictating how Iridium handles this request</param>
    /// <param name="callback" optional="true" value="Model_InstanceCallback_Single">A function to be called once the object has been created</param>
    /// </signature>
    /// <signature>
    /// <summary>Inserts the given objects into the database</summary>
    /// <param name="object" type="Array" elementType="Object">An array of objects representing the properties to set on the newly created objects</param>
    /// <param name="options" type="Object" optional="true">Options dictating how Iridium handles this request</param>
    /// <param name="callback" optional="true" value="Model_InstanceCallback_Multiple">A function to be called once the objects have been created</param>
    /// </signature>
         
    var returnArray = true;

    if(!callback) {
        callback = options;
        options = options || {};
    }
    
    _.defaults(options, {
        wrap: true
    });

    if(!Array.isArray(object)) {
        object = [object];
        returnArray = false;
    }

    var end = (function(err, results) {
        if (err) this.emit('error', err);

        if(!callback) return;
        if(!results) return callback(err);

        if(!Array.isArray(results)) results = [results];

        if(returnArray) return callback(err, results);
        return callback(err, results[0]);
    }).bind(this);

    var prepComplete = (function(err, prepped) {
        if(err) return end(err);
        this.collection.insert(prepped, { w: callback ? 1 : 0 }, (function(err, inserted) {
            if (err) return end(err);
            if(callback)
                return this.onRetrieved(null, inserted, end, null, { wrap: options.wrap, cache: options.cache });
            return end();
        }).bind(this));
    }).bind(this);

    async.parallel(_.map(object, function(obj) {
        return (function (done) {
            var postHook = (function (err) {
                if (err) return done(err);

                var validation = this.schemaValidator.validate(obj);
                if(validation.failed) return done(validation.error);

                // Transform the object
                this.toSource(obj);
                return done(null, obj);
            }).bind(this);

            this.onCreating(obj, postHook);
        }).bind(this);
    }, this), prepComplete);
};

Model.prototype.update = function (conditions, changes, callback) {
    /// <signature>
    /// <summary>Updates all documents in the collection which match the specified conditions - making the requested changes</summary>
    /// <param name="conditions" type="Object">The conditions used to select objects to be updated</param>
    /// <param name="changes" type="Object">The changes to be made to objects in the collection</param>
    /// <param name="callback" optional="true" value="(function(err, count) { })">A function to be called once the update has completed</param>
    /// </signature>
    
    this.toSource(conditions);
    
    this.collection.update(conditions, changes, { w: callback ? 1 : 0, multi: true }, (function(err, modified) {
        if (err) this.emit('error', err);
        return callback(err, modified);
    }).bind(this));
};

Model.prototype.count = function (conditions, callback) {
    /// <signature>
    /// <summary>Counts the number of documents in the collection</summary>
    /// <param name="conditions" type="Object" optional="true">The conditions on which to match documents for counting</param>
    /// <param name="callback" value="(function(err, count) { })">A function to be called once the documents have been counted.</param>
    /// </signature>
    
    if (!callback) {
        callback = conditions;
        conditions = {};
    }

    this.toSource(conditions);

    this.collection.count(conditions, (function(err, count) {
        if (err) this.emit('error', err);
        return callback(err, count);
    }).bind(this));
};

Model.prototype.remove = function (conditions, callback) {
    /// <signature>
    /// <summary>Removes all objects in the collection.</summary>
    /// <param name="callback" value="(function(err, count) { })">A function to be called once all objects have been removed.</param>
    /// </signature>
    /// <signature>
    /// <summary>Removes all occurences in the collection with an _id field matching the given condition value.</summary>
    /// <param name="conditions" type="Mixed">The _id field of the object to locate</param>
    /// <param name="callback" value="(function(err, count) { })">A function to be called once all objects have been removed.</param>
    /// </signature>
    /// <signature>
    /// <summary>Removes all occurences in the collection which match the given conditions.</summary>
    /// <param name="conditions" type="Object">The conditions which will be used to select matches</param>
    /// <param name="callback" value="(function(err, count) { })">A function to be called once all objects have been removed.</param>
    /// </signature>

    if (!callback) {
        callback = conditions;
        conditions = {};
    }
    
    if (!_.isPlainObject(conditions)) conditions = this.downstreamID(conditions);

    this.toSource(conditions);

    if(this.cache && this.cache.valid(conditions))
        this.cache.drop(conditions, (function() {
            this.collection.remove(conditions, { w: callback ? 1 : 0 }, (function(err, modified) {
                if (err) this.emit('error', err);
                return callback(err, modified);
            }).bind(this));
        }).bind(this));
    else
        this.collection.remove(conditions, { w: callback ? 1 : 0 }, (function(err, modified) {
            if (err) this.emit('error', err);
            return callback(err, modified);
        }).bind(this));
};

Model.prototype.aggregate = function () {
    /// <signature>
    /// <summary>Allows you to execute aggregation queries using MongoDB's aggregation framework</summary>
    /// <param name="chain" type="Array" elementType="Object">The aggregation toolchain to run</param>
    /// <param name="callback" type="Function">A function to be called once aggregation has been completed</param>
    /// </signature>
    
    this.collection.aggregate.apply(this.collection, arguments);
};

Model.prototype.ensureIndex = function (spec, options, callback) {
    /// <signature>
    /// <summary>Ensures that an index is present on the database collection</summary>
    /// <param name="spec" type="Object">The description of the index to be created</param>
    /// <param name="callback" type="Function">A function to be called once the operation has completed</param>
    /// </signature>
    /// <signature>
    /// <summary>Ensures that an index is present on the database collection</summary>
    /// <param name="spec" type="Object">The description of the index to be created</param>
    /// <param name="options" type="Object">Options to be applied to the index (unique, sparse, background etc.)</param>
    /// <param name="callback" type="Function">A function to be called once the operation has completed</param>
    /// </signature>

    if (!callback) {
        callback = options;
        options = {};
    }

    this.collection.ensureIndex(spec, options, callback);
};

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
