/// <reference path="../nodelib/node.js"/>
/// <reference path="Instance.js"/>
/// <reference path="Database.js"/>
/// <reference path="utils/validation.js"/>

var _ = require('lodash');
var Instance = require('./Instance');
var validate = require('./utils/validation');
var transform = require('./utils/transforms');
var ObjectID = require('mongodb').ObjectID;


(require.modules || {}).Model = module.exports = Model;

function Model(database, collection, schema, options) {
	/// <summary>Creates a new model around the specified database</summary>
	/// <param name="database" type="Database">The database wrapper on which this model will operate</param>
	/// <param name="collection" type="String">The name of the database collection in which objects of this type are stored</param>
	/// <param name="schema" type="Object">A JSON representation of the database schema</param>
	/// <param name="options" type="Object">Additional options configuring the behaviour of this model's instances</param>

	if (!options) options = {};
	if (!options.hooks) options.hooks = {};

	options.transforms = options.transforms || {};

	_.defaults(options.transforms, {
		_id: {
			$down: function (value) { return new ObjectID(value.id).toHexString(); },
			$up: function (value) { return value ? ObjectID.createFromHexString(value) : undefined; }
		}
	});

	options.schema = schema;


	Object.defineProperty(this, 'collection', {
		get: function () { return database.db.collection(collection); },
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
}

Model.prototype.wrap = function (document, isNew) {
	/// <signature>
	/// <summary>Wraps the given database object in this model's Instance wrapper</summary>
	/// <param name="document" type="Object">The database object to be wrapped by this model</param>
	/// <returns type="Instance"/>
	/// </signature>
	/// <signature>
	/// <summary>Wraps the given database object in this model's Instance wrapper</summary>
	/// <param name="document" type="Object">The database object to be wrapped by this model</param>
	/// <param name="isNew" type="Boolean">Whether or not this instance is new (not in the database)</param>
	/// <returns type="Instance"/>
	/// </signature>
	
	return new Instance(this.collection, document, this.options, isNew);
};

Model.prototype.find = function (conditions, callback) {
	/// <signature>
	/// <summary>Gets all objects in the collection.</summary>
	/// <param name="callback" type="Function">A function to be called with the results once they have been retrieved.</param>
	/// </signature>
	/// <signature>
	/// <summary>Finds all occurences in the collection with an _id field matching the given conditions.</summary>
	/// <param name="conditions" type="Mixed">The _id field of the object to locate</param>
	/// <param name="callback" type="Function">A function to be called with the results once they have been retrieved.</param>
	/// </signature>
	/// <signature>
	/// <summary>Finds all occurences in the collection which match the given conditions.</summary>
	/// <param name="conditions" type="Object">The conditions which will be used to select matches</param>
	/// <param name="callback" type="Function">A function to be called with the results once they have been retrieved.</param>
	/// </signature>

	if (!callback) {
		callback = conditions;
		conditions = {};
	}

	var $ = this;
	if (!_.isPlainObject(conditions)) conditions = { _id: conditions };

	transform.up(this.options.transforms, conditions);

	this.collection.find(conditions).toArray(function (err, results) {
		if (err) return callback(err);
		if (!results) return callback(null, null);
		return callback(null, _.map(results, function (result) { return $.wrap(result, false); }, $));
	});
};

Model.prototype.findOne = Model.prototype.get = function (conditions, callback) {
	/// <signature>
	/// <summary>Gets a single object from the collection.</summary>
	/// <param name="callback" type="Function">A function to be called with the results once they have been retrieved.</param>
	/// </signature>
	/// <signature>
	/// <summary>Finds the first occurence in the collection with an _id field matching the given conditions.</summary>
	/// <param name="conditions" type="Mixed">The _id field of the object to locate</param>
	/// <param name="callback" type="Function">A function to be called with the results once they have been retrieved.</param>
	/// </signature>
	/// <signature>
	/// <summary>Finds the first occurence in the collection which matches the given conditions.</summary>
	/// <param name="conditions" type="Object">The conditions which will be used to select matches</param>
	/// <param name="callback" type="Function">A function to be called with the results once they have been retrieved.</param>
	/// </signature>

	if (!callback) {
		callback = conditions;
		conditions = {};
	}

	var $ = this;
	if (!_.isPlainObject(conditions)) conditions = { _id: conditions };

	transform.up(this.options.transforms, conditions);
	
	this.collection.findOne(conditions, function (err, results) {
		if (err) return callback(err);
		if (!results) return callback(null, null);
		
		return callback(null, $.wrap.call($, results));
	});
};

Model.prototype.insert = Model.prototype.create = function (object, callback) {
	/// <summary>Inserts the given object into the database</summary>
	/// <param name="object" type="Object">The properties to set on the newly created object</param>
	/// <param name="callback" type="Function"></param>

	var $ = this;

	var doInsert = function(err) {
		if(err) return callback(err);

		var validation = validate($.options.schema, object);

		if (!validation.passed) return callback(validation.toError());

		var instance = $.wrap.call($, object, true);	
		instance.save(callback);

		$.setupIndexes();
	};

	if (this.options.hooks.beforeCreate) {
		if (this.options.hooks.beforeCreate.length === 0) this.options.hooks.beforeCreate.call(object);
		else return this.options.hooks.beforeCreate.call(object, doInsert);
	}

	doInsert();
};

Model.prototype.update = function (conditions, changes, callback) {
	/// <signature>
	/// <summary>Updates all documents in the collection which match the specified conditions - making the requested changes</summary>
	/// <param name="conditions" type="Object">The conditions used to select objects to be updated</param>
	/// <param name="changes" type="Object">The changes to be made to objects in the collection</param>
	/// </signature>
	/// <signature>
	/// <summary>Updates all documents in the collection which match the specified conditions - making the requested changes</summary>
	/// <param name="conditions" type="Object">The conditions used to select objects to be updated</param>
	/// <param name="changes" type="Object">The changes to be made to objects in the collection</param>
	/// <param name="callback" type="Function">A function to be called once the update has completed</param>
	/// </signature>

	transform.up(this.options.transforms, conditions);
	this.collection.update(conditions, changes, { w: callback ? 1 : 0, multi: true }, callback);
};

Model.prototype.count = function (conditions, callback) {
	/// <signature>
	/// <summary>Counts the number of documents in the collection</summary>
	/// <param name="callback" type="Function">A function to be called once the documents have been counted.</param>
	/// </signature>
	/// <signature>
	/// <summary>Counts the number of documents in the collection which match the given conditions</summary>
	/// <param name="conditions" type="Object">The conditions on which to match documents for counting</param>
	/// <param name="callback" type="Function">A function to be called once the documents have been counted.</param>
	/// </signature>

	if (!callback) {
		callback = conditions;
		conditions = {};
	}

	transform.up(this.options.transforms, conditions);

	this.collection.count(conditions, callback);
};

Model.prototype.remove = function (conditions, callback) {
	/// <signature>
	/// <summary>Removes all objects in the collection.</summary>
	/// <param name="callback" type="Function">A function to be called once all objects have been removed.</param>
	/// </signature>
	/// <signature>
	/// <summary>Removes all occurences in the collection with an _id field matching the given condition value.</summary>
	/// <param name="conditions" type="Mixed">The _id field of the object to locate</param>
	/// <param name="callback" type="Function">A function to be called once all objects have been removed.</param>
	/// </signature>
	/// <signature>
	/// <summary>Removes all occurences in the collection which match the given conditions.</summary>
	/// <param name="conditions" type="Object">The conditions which will be used to select matches</param>
	/// <param name="callback" type="Function">A function to be called once all objects have been removed.</param>
	/// </signature>

	if (!callback) {
		callback = conditions;
		conditions = {};
	}

	if (!_.isPlainObject(conditions)) conditions = { _id: conditions };

	transform.up(this.options.transforms, conditions);

	this.collection.remove(conditions, { w: callback ? 1 : 0 }, callback);
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
