var ObjectID = require('mongodb').ObjectID,
    _ = require('lodash'),
    EventEmitter = require('events').EventEmitter,
    debug = require('debug')('iridium:Instance'),
    fn = require('functionality'),
    Q = require('q'),

    inherit = require('./utils/Inherit.js'),
    diff = require('./utils/diff.js');


(require.modules || {}).Instance = module.exports = Instance;

function Instance(model, doc, isNew, isPartial) {
    /// <signature>
    /// <summary>Creates a new wrapper around a database document</summary>
    /// <param name="model" type="Model">The model for which the instance should be created</param>
    /// <param name="doc" type="Object">The document from the database which is to be wrapped</param>
    /// </signature>
    /// <signature>
    /// <summary>Creates a new wrapper around a database document</summary>
    /// <param name="model" type="Model">The model for which the instance should be created</param>
    /// <param name="doc" type="Object">The document from the database which is to be wrapped</param>
    /// <param name="isNew" type="Boolean>Should be true if this instance is not present in the database</param>
    /// </signature>
    /// <signature>
    /// <summary>Creates a new wrapper around a database document</summary>
    /// <param name="model" type="Model">The model for which the instance should be created</param>
    /// <param name="doc" type="Object">The document from the database which is to be wrapped</param>
    /// <param name="isPartial" type="Boolean>Should be true if this instance is only a partial representation of what's in the database</param>
    /// </signature>

    "use strict";

    EventEmitter.call(this);

    if(!isNew) model.fromSource(doc);

    this.__state = {
        model: model,
        isNew: isNew || false,
        isPartial: isPartial || false,
        original: _.cloneDeep(doc),
        modified: _.cloneDeep(doc)
    };

    this.__extendSchema();

    for(var i = 0; i < model.database.plugins.length; i++)
        if(model.database.plugins[i].newInstance)
            model.database.plugins[i].newInstance.call(this, model, doc, isNew);

    this.on('error', function(err) {
        debug('encountered an error %s', err.message);
    });

    this.emit('ready', this);
}

Instance.prototype.__proto__ = EventEmitter.prototype;

Object.defineProperty(Instance.prototype, 'document', {
    get: function() { return this.__state.modified; },
    enumerable: false
});

Instance.prototype.save = fn.first(function() {
    this.deferred = Q.defer();
}).on(fn.opt(Function), function(callback) {
    this.conditions = this.context.__state.model.uniqueConditions(this.context.__state.modified);

    var validation = this.context.__state.model.schemaValidator.validate(this.context.__state.modified);
    if(validation.failed) {
        this.aborted = true;
        return this.deferred.reject(validation.error);
    }

    var original = _.cloneDeep(this.context.__state.original);
    var modified = _.cloneDeep(this.context.__state.modified);

    this.context.__state.model.toSource(original);
    this.context.__state.model.toSource(modified);

    this.changes = Instance.diff(original, modified);

    if(callback) promiseCallback(this.deferred.promise, callback);
}).on(Object, fn.opt(Function), function(changes, callback) {
    this.conditions = this.context.__state.model.uniqueConditions(this.context.__state.modified);
    this.changes = changes;

    if(callback) promiseCallback(this.deferred.promise, callback);
}).on(Object, Object, fn.opt(Function), function(conditions, changes, callback) {
    this.conditions = conditions;
    this.changes = changes;

    this.context.__state.model.toSource(this.conditions);
    _.merge(this.conditions, this.context.__state.model.uniqueConditions(this.context.__state.modified));

    if(callback) promiseCallback(this.deferred.promise, callback);
}).then(function() {
    if(this.aborted) return this.deferred.promise;

    if(Object.keys(this.changes).length == 0) {
        this.deferred.resolve(this.context);
        return this.deferred.promise;
    }

    var insert = Q.nbind(this.context.__state.model.collection.insert, this.context.__state.model.collection);
    var update = Q.nbind(this.context.__state.model.collection.update, this.context.__state.model.collection);
    var findOne = Q.nbind(this.context.__state.model.collection.findOne, this.context.__state.model.collection);

    if(this.context.__state.isNew) {
        var toCreate = _.cloneDeep(this.context.__state.modified);

        promisePipe(this.context.__state.model.onCreating(toCreate).then((function(toCreate) {
            this.context.emit('creating', toCreate);

            this.context.__state.model.toSource(toCreate);
            return insert(toCreate, { w: 1 });
        }).bind(this)).then((function(created) {
            this.context.__state.isNew = false;
            this.context.__state.isPartial = false;

            return this.context.__state.model.onRetrieved(this.conditions, created[0], (function(value){
                this.__state.model.fromSource(value);
                this.__state.original = _.cloneDeep(value);
                this.__state.modified = _.cloneDeep(value);
                this.__extendSchema();
                this.emit('retrieved', this);
            }).bind(this.context), { partial: this.context.__state.isPartial });
        }).bind(this)), this.deferred);
    }
    else {
        promisePipe(this.context.__state.model.onSaving(this.context, this.changes).then((function() {
            this.context.emit('saving', this.context, this.changes);

            return update(this.conditions, this.changes, { w: 1 });
        }).bind(this)).then((function(changed) {
            if(!changed) return Q(this.context);

            var conditions = this.context.__state.model.uniqueConditions(this.context.__state.modified);
            return findOne(conditions).then((function(latest) {
                if(!latest) {
                    this.context.__state.isNew = true;
                    return Q(this.context);
                }

                return this.context.__state.model.onRetrieved(conditions, latest, (function (value) {
                    this.__state.model.fromSource(value);
                    this.__state.isPartial = false;
                    this.__state.original = _.cloneDeep(value);
                    this.__state.modified = _.cloneDeep(value);
                    this.__extendSchema();
                    this.emit('retrieved', this);
                    return this;
                }).bind(this.context));
            }).bind(this));
        }).bind(this)).fail((function(err) {
            this.emit('error', err);
            return Q.reject(err);
        }).bind(this.context)), this.deferred);
    }

    return this.deferred.promise;
}).compile();

Instance.prototype.refresh = Instance.prototype.update = function(callback) {
    /// <signature>
    /// <summary>Updates this object from the database, bringing it up to date</summary>
    /// </signature>
    /// <signature>
    /// <summary>Updates this object from the database, bringing it up to date</summary>
    /// <param name="callback" value="callback(new Error(), this)">A function to be called once the update is complete</param>
    /// </signature>

    var deferred = Q.defer();
    if(callback) promiseCallback(deferred.promise, callback);

    var conditions = this.__state.model.uniqueConditions(this.__state.original);
    var findOne = Q.nbind(this.__state.model.collection.findOne, this.__state.model.collection);

    promisePipe(findOne(conditions).then((function(latest) {
        if(!latest) {
            this.__state.isPartial = false;
            this.__state.isNew = true;
            this.__state.original = _.cloneDeep(this.__state.modified);
            return Q(this);
        }
        return this.__state.model.onRetrieved(conditions, latest, (function(value) {
            this.__state.model.fromSource(value);
            this.__state.isNew = false;
            this.__state.isPartial = false;
            this.__state.original = _.cloneDeep(value);
            this.__state.modified = _.cloneDeep(value);
            this.__extendSchema();
            this.emit('retrieved', this);
            return this;
        }).bind(this));
    }).bind(this)).fail((function(err) {
        this.emit('error', err);
        return Q.reject(err);
    }).bind(this)), deferred);

    return deferred.promise;
};

Instance.prototype.remove = Instance.prototype.delete = function(callback) {
    /// <signature>
    /// <summary>Removes this object from the database collection</summary>
    /// </signature>
    /// <signature>
    /// <summary>Removes this object from the database collection</summary>
    /// <param name="callback" value="callback(new Error())">A function to be called when the object has been removed</param>
    /// </signature>

    var deferred = Q.defer();
    if(callback) promiseCallback(deferred.promise, callback);

    if(this.__state.isNew) {
        deferred.resolve(0);
        return deferred.promise;
    }

    var conditions = this.__state.model.uniqueConditions(this.__state.modified);
    this.__state.model.cache.drop(conditions, (function() {
        this.emit('removing', this);
        this.__state.model.collection.remove(conditions, { w: 1 }, (function(err, removed) {
            this.__state.isNew = true;
            if(err) {
                this.emit('error', err);
                return deferred.reject(err);
            }
            
            this.emit('removed', this);
            return deferred.resolve(this);
        }).bind(this));
    }).bind(this));

    return deferred.promise;
};

Instance.prototype.select = function(collection, filter) {
    /// <signature>
    /// <summary>Finds elements in the array for which the filter function returns truey</summary>
    /// <param name="collection" type="Object">The array to search through for matches</param>
    /// <param name="filter" type="Function">A function called with the array's element and its index/key for filtering pursposes</param>
    /// <returns type="Object"/>
    /// </signature>
    /// <signature>
    /// <summary>Finds elements in the array for which the filter function returns truey</summary>
    /// <param name="collection" type="Array">The array to search through for matches</param>
    /// <param name="filter" type="Function">A function called with the array's element and its index/key for filtering pursposes</param>
    /// <returns type="Array"/>
    /// </signature>

    var isArray = Array.isArray(collection);
    var results = isArray ? [] : {};

    _.each(collection, function(value, key) {
        if(filter.call(this, value, key)) {
            if(isArray) results.push(value);
            else results[key] = value;
        }
    }, this);

    return results;
};

Instance.prototype.first = function (collection, filter) {
    /// <signature>
    /// <summary>Finds the first element in the object for which the filter function returns truey</summary>
    /// <param name="collection" type="Object">The array to search through for matches</param>
    /// <param name="filter" type="Function">A function called with the array's element and its index/key for filtering pursposes</param>
    /// <returns type="Mixed"/>
    /// </signature>
    /// <signature>
    /// <summary>Finds the first element in the array for which the filter function returns truey</summary>
    /// <param name="collection" type="Array">The array to search through for matches</param>
    /// <param name="filter" type="Function">A function called with the array's element and its index/key for filtering pursposes</param>
    /// <returns type="Mixed"/>
    /// </signature>

    var result;

    _.each(collection, function (value, key) {
        if (filter.call(this, value, key)) {
            result = value;
            return false;
        }
    }, this);

    return result;
};

Instance.prototype.__extendSchema = function() {
    var $ = this;

    var schema = {}, property;

    for(property in this.__state.modified)
        schema[property] = false;

    for(property in this.__state.model.schema)
        if(schema[property]) delete schema[property];

    for(var targetProperty in schema) {
        if(!$[targetProperty] && !$.hasOwnProperty(targetProperty))
            (function(targetProperty) {
                Object.defineProperty($, targetProperty, {
                    get: function() {
                        /// <value type="Object">Get the most recent value for this field</value>
                        return $.__state.modified[targetProperty];
                    },
                    set: function(value) {
                        /// <value type="Object">Set the value of this field. Changes may be committed by calling save() on this instance.</value>
                        $.__state.modified[targetProperty] = value;
                    },
                    enumerable: true
                });
            })(targetProperty);
    }
};

Instance.forModel = function(model) {
    /// <summary>Creates an instance wrapper for the specified model</summary>
    /// <param name="model" type="Model">The model which the instance wraps</param>

    function ModelInstance(doc, isNew, isPartial) {
        /// <summary>Creates a new model instance for the specified document</summary>
        /// <param name="doc" type="Object">The document which the instance should wrap</param>
        /// <param name="isNew" type="Boolean" optional="true">Whether or not the document was sourced from the database</param>
        /// <param name="isPartial" type="Boolean" optional="true">Whether or not the document represents a partial version of the database document</param>

        Instance.call(this, model, doc, isNew, isPartial);
    }

    inherit(ModelInstance, Instance);

    _.each(model.schema, function(validator, name) {
        Object.defineProperty(ModelInstance.prototype, name, {
            get: function() {
                return this.__state.modified[name] === undefined ? null : this.__state.modified[name];
            },
            set: function(value) {
                this.__state.modified[name] = value;
            },
            enumerable: true
        });
    });

    _.each(model.options.virtuals, function(property, name) {
        if('function' == typeof property)
            Object.defineProperty(ModelInstance.prototype, name, {
                get: property,
                enumerable: true
            });
        else
            Object.defineProperty(ModelInstance.prototype, name, {
                get: property.get,
                set: property.set,
                enumerable: true
            });
    });

    _.each(model.options.methods, function(method, name) {
        Object.defineProperty(ModelInstance.prototype, name, {
            value: method,
            enumerable: false
        });
    });

    return ModelInstance;
};

Instance.diff = diff;


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