/// <reference path="../nodelib/node.js"/>
/// <reference path="Model.js"/>
/// <reference path="Instance.js"/>

var MongoClient = require('mongodb').MongoClient;
var Model = require('./Model');
var Instance = require('./Instance');
var _ = require('lodash');

(require.modules || {}).Database = module.exports = Database;

function Database(config) {
	/// <summary>Creates a new Iridium instance</summary>
	/// <param name="config" type="Object">A configuration object describing the details of the database to connect to</param>

	"use strict";

	this.connection = null;
	this.models = {};
		
	Object.defineProperty(this, 'settings', {
		get: function () {
			"use strict";
			return config;
		},
		enumerable: false
	});
}

Database.Model = Model;
Database.Instance = Instance;

Database.prototype.connect = function (cb) {
	/// <summary>Connects to the database server specified in the provided configuration</summary>
	/// <param name="cb" type="Function">A function to be called when the connection is completed, called immediately if one is already open</param>

	"use strict";

	if (this.connection) return cb(null, this);

	var $ = this;

	MongoClient.connect(this.connect_url, function (err, db) {
		/// <param name="err" type="Error"></param>
		/// <param name="db" type="Database"></param>

		if (err) {
			err.message = 'Failed to establish connection to database server. Please ensure that the server is accessible.';
			return cb(err);
		}

		$.connection = db;

		cb(null, $);
	});
};

Database.prototype.express = function() {
	/// <summary>Creates an Express Middleware which will make this database wrapper available through the req.db property</summary>
	/// <returns type="Function"/>

	"use strict";
	var $ = this;
	
	return function(req, res, next) {
		/// <summary>Express Middleware which will make this database wrapper available through the req.db property</summary>
		/// <param name="req" type="Object">Node Request object</param>
		/// <param name="res" type="Object">Node Response object</param>
		/// <param name="next" type="Function">Callback used to continue to the next step in the Express request pipeline</param>

		$.connect(function (err, _db) {
			if (err) return next(err);
			req.db = _db;
			return next();
		});
	};
};

Database.prototype.register = function (name, model) {
	/// <signature>
	/// <summary>Registers a model with the ORM (not entirely necessary)</summary>
	/// <param name="name" type="String">The name of the model to register with the current connection</param>
	/// <param name="model" type="Model">The model to register with the database connection</param>
	/// </signature>
	/// <signature>
	/// <summary>Registers a model with the ORM (not entirely necessary)</summary>
	/// <param name="name" type="String">The name of the model to register with the ORM</param>
	/// <param name="model" type="Function">A function which creates a model for a given database connection</param>
	/// </signature>
	"use strict";

	var $ = this;

	if (model.isModel)
		this.models[name] = model;
	else this.models[name] = model(this);

	Object.defineProperty($, name, {
		get: function () {
			/// <returns type="Model" />
			return $.models[name];
		},
		enumerable: true
	});
};

Object.defineProperty(Database.prototype, 'connect_url', {
	get: function () {
		/// <summary>Gets a URL which can be used to connec to a MongoDB instance based on the configuration</summary>
		/// <returns type="String" />

		"use strict";
		var uri = 'mongodb://';
		if (this.settings.username && this.settings.password)
			uri += this.settings.username + ':' + this.settings.password + '@';
		uri += this.settings.host || 'localhost';
		if (this.settings.port)
			uri += ':' + this.settings.port;
		uri += '/' + this.settings.database;

		return uri;
	},
	enumerable: false
});

Object.defineProperty(Database.prototype, 'db', {
	get: function () {
		/// <summary>Gets the MongoDB database connection</summary>

		"use strict";
		if (!this.connection) throw new Error('Database connection not yet established');
		return this.connection;
	},
	enumerable: false
});
