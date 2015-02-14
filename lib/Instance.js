var ObjectID = require('mongodb').ObjectID,
    _ = require('lodash'),
    EventEmitter = require('events').EventEmitter,
    debug = require('debug')('iridium:Instance'),
    fn = require('functionality'),
    Promise = require('bluebird'),

    inherit = require('./utils/Inherit.js'),
    diff = require('./utils/diff.js');


(require.modules || {}).IridiumInstance = module.exports = IridiumInstance;

function IridiumInstance(model, doc, isNew, isPartial) {
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

inherit(IridiumInstance, EventEmitter);

Object.defineProperty(IridiumInstance.prototype, 'document', {
    get: function() { return this.__state.modified; },
    enumerable: false
});

IridiumInstance.prototype.save = fn.first(function() {
    this.promise = Promise.bind(this, this.context);

    this.state = this.context.__state;
    this.model = this.state.model;
    this.original = this.state.original;
    this.modified = this.state.modified;
    this.insert = Promise.promisify(this.model.collection.insert, this.model.collection);
    this.update = Promise.promisify(this.model.collection.update, this.model.collection);
    this.findOne = Promise.promisify(this.model.collection.findOne, this.model.collection);
}).on(fn.opt(Function), function(callback) {
    this.conditions = this.model.uniqueConditions(this.modified);

    var validation = this.model.schemaValidator.validate(this.modified);
    if(validation.failed) {
        this.aborted = true;
        return this.promise = Promise.reject(validation.error);
    }

    var original = _.cloneDeep(this.original);
    var modified = _.cloneDeep(this.modified);

    this.model.toSource(original);
    this.model.toSource(modified);

    this.changes = Instance.diff(original, modified);
    this.callback = callback;
}).on(Object, fn.opt(Function), function(changes, callback) {
    this.conditions = this.model.uniqueConditions(this.modified);
    this.changes = changes;
    this.callback = callback;
}).on(Object, Object, fn.opt(Function), function(conditions, changes, callback) {
    this.conditions = conditions;
    this.changes = changes;

    this.model.toSource(this.conditions);
    _.merge(this.conditions, this.model.uniqueConditions(this.modified));
    this.callback = callback;
}).then(function() {
    if(this.aborted) return this.promise;

    if(Object.keys(this.changes).length == 0) {
        return this.promise;
    }

    return this.promise.then(function() {
        if(this.state.isNew) {
            var toCreate = _.cloneDeep(this.modified);

            return this.model.onCreating(toCreate).bind(this).then(function(toCreate) {
                this.context.emit('creating', toCreate);
                this.model.toSource(toCreate);
                return this.insert(toCreate, { w: 1 });
            }).then(function(created) {
                this.state.isNew = false;
                return created;
            });
        } else {
            return this.model.onSaving(this.context, this.changes).bind(this).then(function() {
                this.context.emit('saving', this.context, this.changes);
                return this.update(this.conditions, this.changes, { w: 1 });
            }).then(function(changed) {
                if(!changed) return this.modified;

                var conditions = this.model.uniqueConditions(this.modified);
                return this.findOne(conditions);
            }).then(function(latest) {
                if(!latest) {
                    this.state.isNew = true;
                    return this.modified;
                }
                return latest;
            });
        }
    }).then(function(latest) {
        var conditions = this.model.uniqueConditions(this.modified);
        return this.model.onRetrieved(conditions, latest, (function (value) {
            this.model.fromSource(value);
            this.state.isPartial = false;
            this.state.original = _.cloneDeep(value);
            this.state.modified = _.cloneDeep(value);
            this.context.__extendSchema();
            this.context.emit('retrieved', this.context);
            return this.context;
        }).bind(this)).bind(this);
    }).catch(function(err) {
        this.context.emit('error', err);
        return Promise.reject(err);
    }).nodeify(this.callback);
}).compile();



IridiumInstance.prototype.refresh = IridiumInstance.prototype.update = fn.first(function() {
    this.promise = Promise.bind(this, this.context);

    this.state = this.context.__state;
    this.model = this.state.model;
    this.original = this.state.original;
    this.modified = this.state.modified;
    this.findOne = Promise.promisify(this.model.collection.findOne, this.model.collection);
}).on(fn.opt(Function), function(callback) {
    this.callback = callback;
}).then(function() {
    /// <signature>
    /// <summary>Updates this object from the database, bringing it up to date</summary>
    /// </signature>
    /// <signature>
    /// <summary>Updates this object from the database, bringing it up to date</summary>
    /// <param name="callback" value="callback(new Error(), this)">A function to be called once the update is complete</param>
    /// </signature>

    return this.promise.then(function() {
        var conditions = this.model.uniqueConditions(this.original);
        return this.findOne(conditions).bind(this).then(function(latest) {
            if(!latest) {
                this.state.isPartial = false;
                this.state.isNew = true;
                this.state.original = _.cloneDeep(this.modified);
                return this.context;
            }
            return this.model.onRetrieved(conditions, latest, null, { wrap: false }).bind(this).then(function(value) {
                this.model.fromSource(value);
                this.state.isNew = false;
                this.state.isPartial = false;
                this.state.original = _.cloneDeep(value);
                this.state.modified = _.cloneDeep(value);
                this.context.__extendSchema();
                this.context.emit('retrieved', this.context);
                return this.context;
            }).bind(this);
        });
    }).catch(function(err) {
        this.context.emit('error', err);
        return Promise.reject(err);
    }).nodeify(this.callback);
}).compile();


IridiumInstance.prototype.delete = IridiumInstance.prototype.remove = fn.first(function() {
    this.promise = Promise.bind(this, this.context);

    this.state = this.context.__state;
    this.model = this.state.model;
    this.original = this.state.original;
    this.modified = this.state.modified;
    this.remove = Promise.promisify(this.model.collection.remove, this.model.collection);
}).on(fn.opt(Function), function(callback) {
    this.callback = callback;
}).then(function() {
    /// <signature>
    /// <summary>Updates this object from the database, bringing it up to date</summary>
    /// </signature>
    /// <signature>
    /// <summary>Updates this object from the database, bringing it up to date</summary>
    /// <param name="callback" value="callback(new Error(), this)">A function to be called once the update is complete</param>
    /// </signature>

    return this.promise.then(function() {
        if(this.state.isNew) return 0;

        var conditions = this.model.uniqueConditions(this.modified);
        this.model.cache.drop(conditions);
        this.context.emit('removing', this.context);
        return this.remove(conditions, { w: 1 }).bind(this);
    }).then(function(removed) {
        this.state.isNew = !!removed;
        return this.context;
    }).catch(function(err) {
        this.context.emit('error', err);
        return Promise.reject(err);
    }).nodeify(this.callback);
}).compile();

IridiumInstance.prototype.select = function(collection, filter) {
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

IridiumInstance.prototype.first = function (collection, filter) {
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

IridiumInstance.prototype.__extendSchema = function() {
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

IridiumInstance.forModel = function(model) {
    /// <summary>Creates an instance wrapper for the specified model</summary>
    /// <param name="model" type="Model">The model which the instance wraps</param>

    function IridiumModelInstance(doc, isNew, isPartial) {
        /// <summary>Creates a new model instance for the specified document</summary>
        /// <param name="doc" type="Object">The document which the instance should wrap</param>
        /// <param name="isNew" type="Boolean" optional="true">Whether or not the document was sourced from the database</param>
        /// <param name="isPartial" type="Boolean" optional="true">Whether or not the document represents a partial version of the database document</param>

        IridiumInstance.call(this, model, doc, isNew, isPartial);
    }

    inherit(IridiumModelInstance, IridiumInstance);

    _.each(model.schema, function(validator, name) {
        Object.defineProperty(IridiumModelInstance.prototype, name, {
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
            Object.defineProperty(IridiumModelInstance.prototype, name, {
                get: property,
                enumerable: true
            });
        else
            Object.defineProperty(IridiumModelInstance.prototype, name, {
                get: property.get,
                set: property.set,
                enumerable: true
            });
    });

    _.each(model.options.methods, function(method, name) {
        Object.defineProperty(IridiumModelInstance.prototype, name, {
            value: method,
            enumerable: false
        });
    });

    return IridiumModelInstance;
};

IridiumInstance.diff = diff;