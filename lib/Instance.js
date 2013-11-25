/// <reference path="../nodelib/node.js"/>
/// <reference path="utils/transforms.js"/>
/// <reference path="utils/validation.js"/>

var ObjectID = require('mongodb').ObjectID;
var _ = require('lodash');
var validate = require('./utils/validation');
var transform = require('./utils/transforms');


(require.modules || {}).Instance = module.exports = Instance;

function Instance(collection, doc, options, isNew) {
	/// <signature>
	/// <summary>Creates a new wrapper around a database document</summary>
	/// <param name="collection" type="Object">The database collection from which the document originated</param>
	/// <param name="doc" type="Object">The document from the database which is to be wrapped</param>
	/// <param name="options" type="Object">Additional options used to determine how the instance is handled</param>
	/// </signature>
	/// <signature>
	/// <summary>Creates a new wrapper around a database document</summary>
	/// <param name="collection" type="Object">The database collection from which the document originated</param>
	/// <param name="doc" type="Object">The document from the database which is to be wrapped</param>
	/// <param name="options" type="Object">Additional options used to determine how the instance is handled</param>
	/// <param name="isNew" type="Boolean>Should be true if this instance is not present in the database</param>
	/// </signature>

	"use strict";
	var $ = this;


	options = options || {};
	_.defaults(options, {
		rename: {},
		methods: {},
		virtuals: {},
		schema: {},
		transforms: {}
	});
	
	if (!isNew) transform.down(options.transforms, doc);
	
	var oldDoc = _.cloneDeep(doc);
	var newDoc = _.cloneDeep(doc);
	var k;
	
	Object.defineProperty($, 'id', {
		get: function () {
			/// <value type="Object">The document's unique database identifier field</value>

			return oldDoc._id;
		},
		enumerable: true
	});

	var schema = {};
	for (k in doc) {
		schema[k] = false;
	}
	for (k in options.schema) {
		schema[k] = options.schema[k];
	}
	
	for (k in schema) {

		var targetProperty = k;
		if (options.rename && options.rename[k])
			targetProperty = options.rename[k];

		if (targetProperty === '_id' || targetProperty === "id") continue;

		(function (sourceProperty) {
			if (sourceProperty === '_id' || sourceProperty === 'id')
				Object.defineProperty($, targetProperty, {
					get: function () {
						return newDoc['_id'];
					},
					enumerable: true
				});

			else
				Object.defineProperty($, targetProperty, {
					get: function () {
						/// <value type="Object">Get the most recent value for this field</value>
						
						return newDoc[sourceProperty] === undefined ? null : newDoc[sourceProperty];
					},
					set: function (value) {
						/// <value type="Object">Set the value of this field. Changes may be committed by calling save() on this instance.</value>

						var validation = validate(options.schema[sourceProperty], value, sourceProperty);

						if (!validation.passed) throw validation.toError();

						newDoc[sourceProperty] = value;
					},
					enumerable: true
				});
		})(k);
	}

	for (k in options.methods) {
		if (k === '_id' || k === "id") continue;
		
		(function (sourceProperty) {
			Object.defineProperty($, sourceProperty, {
				value: function () {
					return options.methods[sourceProperty].apply($, arguments);
				}
			});
		})(k);
	}

	for (k in options.virtuals) {
		if (k === '_id' || k === "id") continue;

		(function (sourceProperty) {
			Object.defineProperty($, sourceProperty, {
				get: function () {
					return options.virtuals[sourceProperty].call($);
				}
			});
		})(k);
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
				transform.up(options.transforms, createDoc);

				collection.insert(createDoc, { w: 1 }, function (err, inserted) {
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

				transform.up(options.transforms, transformedOld);
				transform.up(options.transforms, transformedNew);

				changes = diffPatch(transformedOld, transformedNew);
			}

			if (!!isNew || Object.keys(changes).length > 0) {
				var runOptions = function () {
					
					var conditions = { _id: $.id };

					transform.up(options.transforms, conditions);

					collection.update(conditions, changes, { w: 1 }, function (err, updateCount) {
						if (err) return cb(err);

						if (updateCount > 0) {
							collection.findOne(conditions, function (err, updated) {
								if (err) return cb(err);
								
								transform.down(options.transforms, updated);

								oldDoc = newDoc = updated;
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

			transform.up(options.transforms, conditions);

			collection.findOne(conditions, function (err, updated) {
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

				transform.up(options.transforms, conditions);

				collection.remove(conditions, callback);
			} else {
				callback(null, 0); // No objects removed from the database
			}
		},
		enumerable: false
	});
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