/// <reference path="../nodelib/node.js"/>
/// <reference path="Instance.js"/>
/// <reference path="Database.js"/>
/// <reference path="utils/validation.js"/>

var _ = require('lodash');
var Database = require('./Database');
var Instance = require('./Instance');
var validate = require('./utils/validation');
var Concoction = require('concoction');
var ObjectID = require('mongodb').ObjectID;


(require.modules || {}).Model = module.exports = Model;

function Model(database, collection, schema, options) {
	/// <summary>Creates a new model around the specified database</summary>
	/// <param name="database" type="Database">The database wrapper on which this model will operate</param>
	/// <param name="collection" type="String">The name of the database collection in which objects of this type are stored</param>
	/// <param name="schema" type="Object">A JSON representation of the database schema</param>
	/// <param name="options" type="Object">Additional options configuring the behaviour of this model's instances</param>

	if(!(this instanceof Model)) return new Model(database, collection, schema, options);

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

	Object.defineProperty(this, 'options', {
		get: function () { return options; },
		enumerable: false
	});

	Object.defineProperty(this, 'isModel', {
		value: true,
		enumerable: false
	});


	var extraValidators = [];
	for(var i = 0; i < database.plugins.length; i++) {
		if(database.plugins[i].validate)
			extraValidators.push(database.plugins[i].validate);
	}

	Object.defineProperty(this, 'extraValidators', {
		get: function() { return extraValidators; }
	});

	for(var i = 0; i < database.plugins.length; i++) {
		if(database.plugins[i].newModel) database.plugins[i].newModel.call(this, database, collection, schema, options);
	}
}

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
		_id: testDoc[_id]
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
	/// <param name="id" type="Mixed">The identifier to created the conditions from</param>
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
	/// <returns type="Instance"/>
	/// </signature>
	/// <signature>
	/// <summary>Wraps the given database object in this model's Instance wrapper</summary>
	/// <param name="document" type="Object">The database object to be wrapped by this model</param>
	/// <param name="isNew" type="Boolean">Whether or not this instance is new (not in the database)</param>
	/// <returns type="Instance"/>
	/// </signature>
	
	return new Instance(this, document, isNew);
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
	if (!_.isPlainObject(conditions)) conditions = this.downstreamID(conditions);
	this.toSource(conditions);

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
	if (!_.isPlainObject(conditions)) conditions = this.downstreamID(conditions);

	this.toSource(conditions);
	
	this.collection.findOne(conditions, function (err, results) {
		if (err) return callback(err);
		if (!results) return callback(null, null);
		
		return callback(null, $.wrap.call($, results));
	});
};

Model.prototype.insert = Model.prototype.create = function (object, callback) {
	/// <signature>
	/// <summary>Inserts the given object into the database</summary>
	/// <param name="object" type="Object">The properties to set on the newly created object</param>
	/// </signature>
	/// <signature>
	/// <summary>Inserts the given object into the database</summary>
	/// <param name="object" type="Array" elementType="Object">An array of objects representing the properties to set on the newly created objects</param>
	/// </signature>
	/// <signature>
	/// <summary>Inserts the given object into the database</summary>
	/// <param name="object" type="Object">The properties to set on the newly created object</param>
	/// <param name="callback" type="Function">A function to be called once the object has been created</param>
	/// </signature>
	/// <signature>
	/// <summary>Inserts the given object into the database</summary>
	/// <param name="object" type="Array" elementType="Object">An array of objects representing the properties to set on the newly created objects</param>
	/// <param name="callback" type="Function">A function to be called once the objects have been created</param>
	/// </signature>

	var $ = this;

	var returnArray = true;

	if(!Array.isArray(object)) {
		object = [object];
		returnArray = false;
	}


	var prepped = [];

	var end = function(err, results) {
		if(!callback) return;

		if(!results) return callback(err);

		if(!Array.isArray(results)) results = [results];

		if(returnArray) return callback(err, results);
		return callback(err, results[0]);
	};

	var prepComplete = function() {
		$.collection.insert(prepped, { w: callback ? 1 : 0 }, function(err, inserted) {
			if(err) return end(err);
			return end(null, inserted.map(function(item) { return $.wrap(item, false); }));
		});
	};

	var prepNext = function(err) {
		if(err) return end(err);
		if(object.length === 0) return prepComplete();

		var obj = object.shift();

		var postHook = function(err) {
			if(err) return prepNext(err);

			// Validate the object
			var validation = validate($.schema, obj, undefined, $.extraValidators);
			if(!validation.passed) return prepNext(validation.toError());

			// Transform the object
			$.toSource(obj);

			prepped.push(obj);
			return prepNext();
		}

		// Run the beforeCreate hook
		if($.options.hooks.beforeCreate) {
			if($.options.hooks.beforeCreate.length > 0) return $.options.hooks.beforeCreate.call(obj, postHook);
			else try {
				$.options.hooks.beforeCreate.call(obj);
				postHook();
			} catch(ex) {
				postHook(ex);
			}
		} else postHook();
	};

	prepNext();
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
	
	this.toSource(conditions);

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

	this.toSource(conditions);

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

	if (!_.isPlainObject(conditions)) conditions = this.downstreamID(conditions);

	this.toSource(conditions);

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
