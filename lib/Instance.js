/// <reference path="../nodelib/node.js"/>
/// <reference path="utils/transforms.js"/>
/// <reference path="utils/validation.js"/>

var ObjectID = require('mongodb').ObjectID,
	_ = require('lodash'),
	EventEmitter = require('events').EventEmitter,
	debug = require('debug')('iridium:Instance'),

	validate = require('./utils/validation'),
	diff = require('./utils/diff');


(require.modules || {}).Instance = module.exports = Instance;

function Instance(model, doc, isNew) {
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

	"use strict";

	EventEmitter.call(this);
	
	if(!isNew) model.fromSource(doc);

	this.__state = {
		model: model,
		isNew: isNew,
		original: _.cloneDeep(doc),
		modified: _.cloneDeep(doc)
	}

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

Instance.prototype.save = function(conditions, changes, callback) {
	/// <signature>
	/// <summary>Saves changes made to the current instance to the database without waiting for a response</summary>
	/// </signature>
	/// <signature>
	/// <summary>Saves changes made to the current instance to the database without waiting for a response</summary>
	/// <param name="changes" type="Object">MongoDB changes query to be used instead of differential patching</param>
	/// </signature>
	/// <signature>
	/// <summary>Saves changes made to the current instance to the database</summary>
	/// <param name="callback" type="Function">A function which is called when the save has been completed</param>
	/// </signature>
	/// <signature>
	/// <summary>Saves changes made to the current instance to the database</summary>
	/// <param name="changes" type="Object">MongoDB changes query to be used instead of differential patching</param>
	/// <param name="callback" type="Function">A function which is called when the save has been completed</param>
	/// </signature>
	/// <signature>
	/// <summary>Saves changes made to the current instance to the database</summary>
	/// <param name="conditions" type="Object">A set of conditions used to determine aspects of the document to update, merged with _id: ...</param>
	/// <param name="changes" type="Object">MongoDB changes query to be used instead of differential patching</param>
	/// </signature>
	/// <signature>
	/// <summary>Saves changes made to the current instance to the database</summary>
	/// <param name="conditions" type="Object">A set of conditions used to determine aspects of the document to update, merged with _id: ...</param>
	/// <param name="changes" type="Object">MongoDB changes query to be used instead of differential patching</param>
	/// <param name="callback" type="Function">A function which is called when the save has been completed</param>
	/// </signature>

	var args = Array.prototype.splice.call(arguments, 0);
	conditions = null;
	changes = null;
	callback = null;

	for(var i = args.length - 1; i >= 0; i--) {
		if('function' == typeof args[i]) callback = args[i];
		else if(!changes) changes = args[i];
		else conditions = args[i];
	}

	conditions = conditions || {};

	var onError = (function (err) {
		this.emit('error', err);
		if(callback) return callback(err);
		else throw err;
	}).bind(this);

	if(this.__state.isNew) {
		var toCreate = _.cloneDeep(this.__state.modified);

		this.__state.model.onCreating(toCreate, (function(err) {
			if(err) return onError(err);
			this.emit('creating', toCreate);

			this.__state.model.toSource(toCreate);
			this.__state.model.collection.insert(toCreate, { w: 1 }, (function(err, created) {
				if(err) return onError(err);

				this.__state.isNew = false;
				this.__state.model.onRetrieved(conditions, created[0], callback || function() { }, (function(value) {
					this.__state.model.fromSource(value);
					this.__state.original = _.cloneDeep(value);
					this.__state.modified = _.cloneDeep(value);
					this.__extendSchema();
					this.emit('retrieved', this);
					return this;
				}).bind(this));
			}).bind(this));
		}).bind(this));
	}

	if(!changes) {
		var validation = validate(this.__state.model.schema, this.__state.modified, undefined, this.__state.model.extraValidators);
		if(!validation.passed) return callback(validation.toError());

		var original = _.cloneDeep(this.__state.original);
		var modified = _.cloneDeep(this.__state.modified);

		this.__state.model.toSource(original);
		this.__state.model.toSource(modified);

		changes = Instance.diff(original, modified);
	}

	if(Object.keys(changes).length === 0) return (callback || function() { })(null, this);

	this.__state.model.onSaving(this, changes, (function(err) {
		if(err) return onError(err);
		this.emit('saving', this, changes);

		this.__state.model.toSource(conditions);
		_.merge(conditions, this.__state.model.uniqueConditions(this.__state.modified));

		this.__state.model.collection.update(conditions, changes, { w : 1 }, (function(err, changed) {
			if(err) return onError(err);
			if(!changed) return (callback || function() { })(null, this);

			var conditions = this.__state.model.uniqueConditions(this.__state.modified);
			this.__state.model.collection.findOne(conditions, (function(err, latest) {
				if(err) return onError(err);

				this.__state.model.onRetrieved(conditions, latest, callback || function() { }, (function(value) {
					this.__state.model.fromSource(value);
					this.__state.original = _.cloneDeep(value);
					this.__state.modified = _.cloneDeep(value);
					this.__extendSchema();
					this.emit('retrieved', this);
					return this;
				}).bind(this));
			}).bind(this));
		}).bind(this))
	}).bind(this));
};

Instance.prototype.refresh = Instance.prototype.update = function(callback) {
	/// <signature>
	/// <summary>Updates this object from the database, bringing it up to date</summary>
	/// </signature>
	/// <signature>
	/// <summary>Updates this object from the database, bringing it up to date</summary>
	/// <param name="callback" type="Function">A function to be called once the update is complete</param>
	/// </signature>

	var onError = (function (err) {
		this.emit('error', err);
		if(callback) return callback(err);
		else throw err;
	}).bind(this);

	var conditions = this.__state.model.uniqueConditions(this.__state.original);
	this.__state.model.collection.findOne(conditions, (function(err, latest) {
		if(err) return onError(err);
		
		this.__state.model.onRetrieved(conditions, latest, callback || function() { }, (function(value) {
			this.__state.model.fromSource(value);
			this.__state.original = _.cloneDeep(value);
			this.__state.modified = _.cloneDeep(value);
			this.__extendSchema();
			this.emit('retrieved', this);
			return this;
		}).bind(this));
	}).bind(this));
};

Instance.prototype.remove = Instance.prototype.delete = function(callback) {
	/// <summary>Removes this object from the database collection</summary>
	/// <param name="callback" type="Function">A function to be called when the object has been removed</param>

	if(this.__state.isNew) return (callback || function() { })(null, 0);

	var conditions = this.__state.model.uniqueConditions(this.__state.modified);
	this.__state.model.cache.drop(conditions, (function() {
		this.emit('removing', this);
		this.__state.model.collection.remove(conditions, { w: callback ? 1 : 0 }, (function(err, removed) {
			if(err) this.emit('error', err);
			else this.emit('removed', this);
			this.__state.isNew = true;
			return callback(err, removed);
		}).bind(this));
	}).bind(this));
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

Instance.prototype.first = function(collection, filter) {
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

	_.each(collection, function(value, key) {
		if(filter.call(this, value, key)) {
			result = value;
			return false;
		}
	}, this);

	return result;
}

Instance.prototype.__extendSchema = function() {
	var $ = this;

	var schema = {};

	for(var property in this.__state.modified)
		schema[property] = false;
			
	for(var property in this.__state.model.schema)
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
	/// <return type="Function"/>

	function ModelInstance(doc, isNew) {
		/// <signature>
		/// <summary>Creates a new model instance for the specified document</summary>
		/// <param name="doc" type="Object">The document which the instance should wrap</param>
		/// </signature>
		/// <signature>
		/// <summary>Creates a new model instance for the specified document</summary>
		/// <param name="doc" type="Object">The document which the instance should wrap</param>
		/// <param name="isNew" type="Boolean">Whether or not the document was sourced from the database</param>
		/// </signature>

		Instance.call(this, model, doc, isNew);
	}

	var proto = {};

	_.each(model.schema, function(validator, name) {
		Object.defineProperty(proto, name, {
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
			Object.defineProperty(proto, name, {
				get: property,
				enumerable: true
			});
		else
			Object.defineProperty(proto, name, {
				get: property.get,
				set: property.set,
				enumerable: true
			});
	});

	proto.__proto__ = Instance.prototype;

	_.each(model.options.methods, function(method, name) {
		proto[name] = method;
	});

	ModelInstance.prototype = proto;

	return ModelInstance;
};

Instance.diff = diff;