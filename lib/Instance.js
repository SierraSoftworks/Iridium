/// <reference path="../nodelib/node.js"/>
/// <reference path="utils/transforms.js"/>
/// <reference path="utils/validation.js"/>

var ObjectID = require('mongodb').ObjectID;
var _ = require('lodash');
var validate = require('./utils/validation');


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
}

Instance.prototype.save = function(changes, callback) {
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

	if(!callback && typeof changes == 'function') {
		callback = changes;
		changes = null;
	}

	function onError(err) {
		if(callback) return callback(err);
		else throw err;
	}

	if(this.__state.isNew) {
		var toCreate = _.cloneDeep(this.__state.modified);

		this.__state.model.onCreating(toCreate, (function(err) {
			if(err) return onError(err);

			this.__state.model.toSource(toCreate);
			this.__state.model.collection.insert(toCreate, { w: 1 }, (function(err, created) {
				if(err) return onError(err);

				this.__state.isNew = false;
				this.__state.model.onRetrieved(created[0], callback || function() { }, (function(value) {
					this.__state.model.fromSource(value);
					this.__state.original = _.cloneDeep(value);
					this.__state.modified = _.cloneDeep(value);
					this.__extendSchema();
					return this;
				}).bind(this));
			}).bind(this));
		}).bind(this));
	}

	if(!changes) {
		var original = _.cloneDeep(this.__state.original);
		var modified = _.cloneDeep(this.__state.modified);

		this.__state.model.toSource(original);
		this.__state.model.toSource(modified);

		changes = Instance.diff(original, modified);
	}

	if(Object.keys(changes).length === 0) return (callback || function() { })(null, this);

	this.__state.model.onSaving(this, changes, (function(err) {
		if(err) return onError(err);

		var conditions = this.__state.model.uniqueConditions(this.__state.modified);

		this.__state.model.collection.update(conditions, changes, { w : 1 }, (function(err, changed) {
			if(err) return onError(err);
			if(!changed) return (callback || function() { })(null, this);

			this.__state.model.collection.findOne(conditions, (function(err, latest) {
				if(err) return onError(err);

				this.__state.model.onRetrieved(latest, callback || function() { }, (function(value) {
					this.__state.model.fromSource(value);
					this.__state.original = _.cloneDeep(value);
					this.__state.modified = _.cloneDeep(value);
					this.__extendSchema();
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

	function onError(err) {
		if(callback) return callback(err);
		else throw err;
	}

	var conditions = this.__state.model.uniqueConditions(this.__state.original);
	this.__state.model.collection.findOne(conditions, (function(err, latest) {
		if(err) return onError(err);

		this.__state.model.onRetrieved(latest, callback || function() { }, (function(value) {
			this.__state.model.fromSource(value);
			this.__state.original = _.cloneDeep(value);
			this.__state.modified = _.cloneDeep(value);
			this.__extendSchema();
			return this;
		}).bind(this));
	}).bind(this));
};

Instance.prototype.remove = Instance.prototype.delete = function(callback) {
	/// <summary>Removes this object from the database collection</summary>
	/// <param name="callback" type="Function">A function to be called when the object has been removed</param>

	if(this.__state.isNew) return (callback || function() { })(null, 0);

	var conditions = this.__state.model.uniqueConditions(this.__state.modified);
	this.__state.model.collection.remove(conditions, { w: callback ? 1 : 0 }, callback);
};

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
						var validation = validate(schema[targetProperty], value, targetProperty, this.__state.model.extraValidators);
						if (!validation.passed) throw validation.toError();
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
				var validation = validate(validator, value, name, model.extraValidators);
				if(!validation.passed) throw validation.toError();
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

var diffPatch = Instance.diff = function (oldDoc, newDoc, path) {
	/// <signature>
	/// <summary>Creates a differential update query for use by MongoDB</summary>
	/// <param name="oldDoc" type="Object">The original document prior to any changes</param>
	/// <param name="newDoc" type="Object">The document containing the changes made to the original document</param>
	/// </signature>

	"use strict";

	var changes = {};
	
	for (var k in newDoc) {
		if (Array.isArray(newDoc[k]) && Array.isArray(oldDoc[k])) {
			var different = newDoc.length !== oldDoc.length;
			for (var i = 0; i < newDoc[k].length && !different; i++) {
				if (oldDoc[k][i] !== newDoc[k][i]) different = true;
			}
			if (!different) continue;
			changes.$set = changes.$set || {};
			changes.$set[(path ? (path + '.') : '') + k] = newDoc[k];
		}
		else if (_.isPlainObject(newDoc[k]) && _.isPlainObject(oldDoc[k])) {
			// Make recursive diff update
			_.merge(changes, diffPatch(oldDoc[k], newDoc[k], (path ? (path + '.') : '') + k));
		}
		else {
			if (oldDoc[k] === newDoc[k]) continue;
			changes.$set = changes.$set || {};
			changes.$set[(path ? (path + '.') : '') + k] = newDoc[k];
		}
	}

	return changes;
};