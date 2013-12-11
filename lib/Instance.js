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
	var $ = this;

	validate.extra = model.extraValidators;
	
	if(!isNew) model.fromSource(doc);
	
	var oldDoc = _.cloneDeep(doc);
	var newDoc = _.cloneDeep(doc);
	
	var schema = {};

	for(var property in doc)
		schema[property] = false;
	
	for(var property in model.options.schema)
		schema[property] = model.options.schema[property];
	
	for(var targetProperty in schema) {
		(function(targetProperty) {
			Object.defineProperty($, targetProperty, {
				get: function() {
					/// <value type="Object">Get the most recent value for this field</value>
					return newDoc[targetProperty];
				},
				set: function(value) {
					/// <value type="Object">Set the value of this field. Changes may be committed by calling save() on this instance.</value>
					var validation = validate(schema[targetProperty], value, targetProperty);
					if (!validation.passed) throw validation.toError();

					newDoc[targetProperty] = value;
				},
				enumerable: true
			});
		})(targetProperty);
	}

	for (var methodName in model.options.methods) {		
		(function (methodName) {
			Object.defineProperty($, methodName, {
				value: function () {
					return model.options.methods[methodName].apply($, arguments);
				}
			});
		})(methodName);
	}

	for (var propertyName in model.options.virtuals) {
		(function (propertyName) {
			if(typeof model.options.virtuals[propertyName] == 'function')
				Object.defineProperty($, propertyName, {
					get: function () {
						return model.options.virtuals[propertyName].call($);
					},
					enumerable: true
				});
			else
				Object.defineProperty($, propertyName, {
					get: function () {
						return model.options.virtuals[propertyName].get.call($);
					},
					set: function(value) {
						return model.options.virtuals[propertyName].set.call($, value);
					},
					enumerable: true
				});
		})(propertyName);
	}

	Object.defineProperty($, 'save', {
		value: function (changes, cb) {
			/// <signature>
			/// <summary>Saves changes made to the current instance to the database without waiting for a response</summary>
			/// </signature>
			/// <signature>
			/// <summary>Saves changes made to the current instance to the database without waiting for a response</summary>
			/// <param name="changes" type="Object">MongoDB changes query to be used instead of differential patching</param>
			/// </signature>
			/// <signature>
			/// <summary>Saves changes made to the current instance to the database</summary>
			/// <param name="cb" type="Function">A function which is called when the save has been completed</param>
			/// </signature>
			/// <signature>
			/// <summary>Saves changes made to the current instance to the database</summary>
			/// <param name="changes" type="Object">MongoDB changes query to be used instead of differential patching</param>
			/// <param name="cb" type="Function">A function which is called when the save has been completed</param>
			/// </signature>
			
			if (!cb && typeof changes === 'function') {
				cb = changes;
				changes = null;
			}

			if (!cb) cb = function () { };
			
			var createObject = function (callback) {

				var createDoc = _.cloneDeep(newDoc);
				model.toSource(createDoc);

				model.collection.insert(createDoc, { w: 1 }, function (err, inserted) {
					if (err) return callback(err);

					inserted = inserted[0];
					transform.down(options.transforms, inserted);

					oldDoc = newDoc = inserted;
					
					isNew = false;

					return callback(null, $);
				});
			};

			if (!changes) {
				var transformedOld = _.cloneDeep(oldDoc);
				var transformedNew = _.cloneDeep(newDoc);

				model.toSource(transformedOld);
				model.toSource(transformedNew);

				changes = diffPatch(transformedOld, transformedNew);
			}

			if (!!isNew || Object.keys(changes).length > 0) {
				var runOptions = function () {
					
					var conditions = { _id: $.id };

					model.toSource(conditions);

					model.collection.update(conditions, changes, { w: 1 }, function (err, updateCount) {
						if (err) return cb(err);

						if (updateCount > 0) {
							model.collection.findOne(conditions, function (err, updated) {
								if (err) return cb(err);
								
								model.fromSource(updated);

								newDoc = _.clone(updated);
								oldDoc = _.clone(updated);

								return cb(null, $);
							});
						} else return cb(null, $);
					});
				};

				if (oldDoc._id && !isNew) return runOptions();
				else createObject(function (err) {
					if (err) return cb(err);
					if (Object.keys(changes).length > 0) runOptions(cb);
					else return cb(null, $);
				});
			}
			else return cb(null, $);
		},
		enumerable: false
	});

	Object.defineProperty($, 'update', {
		value: function (callback) {
			/// <signature>
			/// <summary>Updates this object from the database, bringing it up to date</summary>
			/// </signature>
			/// <signature>
			/// <summary>Updates this object from the database, bringing it up to date</summary>
			/// <param name="callback" type="Function">A function to be called once the update is complete</param>
			/// </signature>

			var conditions = { _id: $.id };

			model.toSource(conditions);

			model.collection.findOne(conditions, function (err, updated) {
				if (err) return cb(err);

				transform.down(options.transforms, updated);

				oldDoc = newDoc = updated;

				if(callback) return callback(null, $);
			});
		}
	});

	Object.defineProperty($, 'remove', {
		value: function (callback) {
			/// <summary>Removes this object from the database collection</summary>
			/// <param name="callback" type="Function">A function to be called when the object has been removed</param>

			if (oldDoc._id) {
				var conditions = { _id: $.id };

				model.toSource(conditions);

				model.collection.remove(conditions, callback);
			} else {
				callback(null, 0); // No objects removed from the database
			}
		},
		enumerable: false
	});

	for(var i = 0; i < model.database.plugins.length; i++)
		if(model.database.plugins[i].newInstance)
			model.database.plugins[i].newInstance.call(this, model, doc, isNew);
}

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