var MongoClient = require('mongodb').MongoClient,
    _ = require('lodash'),
    fn = require('functionality'),
    Q = require('q');

var Model = require('./Model.js'),
    Instance = require('./Instance.js');

(require.modules || {}).Database = module.exports = Database;

function Database(uri, config) {
    /// <summary>Creates a new Iridium instance</summary>
    /// <param name="uri" type="String" optional="true">A MongoDB URI which can be used to connect to the database</param>
    /// <param name="config" type="Object" optional="true">A configuration object describing the details of the database to connect to and which becomes available as db.settings</param>

    "use strict";
    if(!(this instanceof Database)) return new Database(config);

    this.connection = null;
    this.models = {};
    this.plugins = [];

    var args = Array.prototype.slice.call(arguments, 0);
    uri = config = null;
    for(var i = 0; i < args.length; i++) {
        if(typeof args[i] == 'string')
            uri = args[i];
        else if(typeof args[i] == 'object')
            config = args[i];
    }

    if(!uri && !config) throw new Error("Expected either a URI or config object to be supplied when initializing Iridium");
        
    if(uri) {
        Object.defineProperty(this, 'uri', {
            get: function () {
                return config;
            },
            enumerable: false
        });
    }
    if(config) {
        Object.defineProperty(this, 'settings', {
            get: function () {
                return config;
            },
            enumerable: false
        });
    }
}

Database.Model = Model;
Database.Instance = Instance;

Database.prototype = {
    get uri() {
        /// <summary>Gets a URL which can be used to connect to a MongoDB instance based on the configuration</summary>
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
    get db() {
        /// <summary>Gets the MongoDB database connection</summary>

        "use strict";
        if (!this.connection) throw new Error('Database connection not yet established');
        return this.connection;
    }
};

Database.prototype.connect = function connect(cb) {
    /// <summary>Connects to the database server specified in the provided configuration</summary>
    /// <param name="cb" type="Function" optional="true">A function to be called when the connection is completed, called immediately if one is already open</param>

    "use strict";
    var deferred = Q.defer();

    if(cb) deferred.promise.then(function(result) { return cb(null, result); }, function(err) { return cb(err); });

    if (this.connection) deferred.resolve(this);
    else MongoClient.connect(this.uri, (function (err, db) {
        /// <param name="err" type="Error"></param>
        /// <param name="db" type="Database"></param>

        if (err) {
            err.message = 'Failed to establish connection to database server. Please ensure that the server is accessible.';
            return deferred.reject(err);
        }

        this.connection = db;

        return deferred.resolve(this);
    }).bind(this));

    return deferred.promise;
};

Database.prototype.close = Database.prototype.disconnect = function disconnect() {
    /// <summary>Closes the active database connection</summary>
    
    "use strict";
    if(!this.connection) return;
    this.connection.close();
    this.connection = null;
 };

Database.prototype.express = function express() {
    /// <summary>Creates an Express Middleware which will make this database wrapper available through the req.db property</summary>
    /// <returns type="Function"/>

    "use strict";
    
    return (function(req, res, next) {
        /// <summary>Express Middleware which will make this database wrapper available through the req.db property</summary>
        /// <param name="req" type="Object">Node Request object</param>
        /// <param name="res" type="Object">Node Response object</param>
        /// <param name="next" type="Function">Callback used to continue to the next step in the Express request pipeline</param>

        this.connect(function (err, _db) {
            if (err) return next(err);
            req.db = _db;
            return next();
        });
    }).bind(this);
};

Database.prototype.register = function register() {
    /// <signature>
    /// <summary>Registers a plugin with the ORM, allowing extended functionality</summary>
    /// <param name="plugin" type="Object">The plugin</param>
    /// </signature>
    /// <signature>
    /// <summary>Registers a model with the ORM (not entirely necessary)</summary>
    /// <param name="name" type="String">The name of the model to register with the current connection</param>
    /// <param name="model" type="Model">The model to register with the database connection</param>
    /// </signature>
    /// <signature>
    /// <summary>Registers a model with the ORM (not entirely necessary)</summary>
    /// <param name="name" type="String">The name of the model to register with the ORM</param>
    /// <param name="modelFactory" type="Function">A function which creates a model for a given database connection</param>
    /// </signature>
    "use strict";

    var args = Array.prototype.slice.call(arguments, 0);

    if(args.length === 1) {
        // Plugin registration
        var plugin = args[0];

        this.plugins.push(plugin);
    } else if(args.length === 2) {
        // Model registration
        var name = args[0];
        var model = args[1];

        if (model.isModel)
            this.models[name] = model;
        else this.models[name] = model(this);

        Object.defineProperty(this, name, {
            get: function () {
                /// <returns type="Model" />
                return this.models[name];
            },
            enumerable: true
        });
    }

    return this;
};
