/// <reference path='../typings/node/node.d.ts' />
/// <reference path='../typings/mongodb/mongodb.d.ts' />
/// <reference path='../typings/lodash/lodash.d.ts' />
/// <reference path='../typings/bluebird/bluebird.d.ts' />
/// <reference path='./Model' />
/// <reference path='./Instance' />
var Promise = require('bluebird');
var MongoDB = require('mongodb');
var expressMiddleware = require('./middleware/Express');
var noOpCache = require('./caches/NoOpCache');
var MongoConnectAsyc = Promise.promisify(MongoDB.MongoClient.connect);
var Core = (function () {
    /**
     * Creates a new Iridium Core instance connected to the specified MongoDB instance
     * @param {String} url The URL of the MongoDB instance to connect to
     * @param {Iridium.IridiumConfiguration} config The config object made available as settings
     * @constructs Core
     */
    function Core(url, config) {
        this._cache = new noOpCache();
        var args = Array.prototype.slice.call(arguments, 0);
        url = config = null;
        for (var i = 0; i < args.length; i++) {
            if (typeof args[i] == 'string')
                url = args[i];
            else if (typeof args[i] == 'object')
                config = args[i];
        }
        if (!url && !config)
            throw new Error("Expected either a URI or config object to be supplied when initializing Iridium");
        this._url = url;
        this._config = config;
    }
    Object.defineProperty(Core.prototype, "models", {
        /**
         * Gets the models registered with this Iridium Core
         * @returns {{}}
         */
        get: function () {
            return this._models;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Core.prototype, "plugins", {
        /**
         * Gets the plugins registered with this Iridium Core
         * @returns {[Iridium.Plugin]}
         */
        get: function () {
            return this._plugins;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Core.prototype, "settings", {
        /**
         * Gets the configuration specified in the construction of this
         * Iridium Core.
         * @returns {Iridium.Configuration}
         */
        get: function () {
            return this._config;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Core.prototype, "connection", {
        /**
         * Gets the currently active database connection for this Iridium
         * Core.
         * @returns {MongoDB.Db}
         */
        get: function () {
            return this._connection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Core.prototype, "url", {
        /**
         * Gets the URL used to connect to MongoDB
         * @returns {String}
         */
        get: function () {
            if (this._url)
                return this._url;
            var url = 'mongodb://';
            url += (this._config.host || 'localhost');
            if (this._config.port)
                url += ':' + this._config.port;
            return url;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Core.prototype, "cache", {
        /**
         * Gets the cache used to store objects retrieved from the database for performance reasons
         * @returns {cache}
         */
        get: function () {
            return this._cache;
        },
        set: function (value) {
            this._cache = value;
        },
        enumerable: true,
        configurable: true
    });
    Core.prototype.register = function (arg0, arg1) {
        if (typeof arg0 == 'object') {
            this.plugins.push(arg0);
            return this;
        }
        if (arg1.isModel)
            this.models[arg0] = arg1;
        else
            this.models[arg0] = arg1(this);
        Object.defineProperty(this, arg0, {
            get: function () {
                return this.models[arg0];
            },
            enumerable: false
        });
        return this;
    };
    /**
     * Connects to the database server specified in the provided configuration
     * @param {function(Error, Iridium.Core)} [callback] A callback to be triggered once the connection is established.
     * @returns {Promise}
     */
    Core.prototype.connect = function (callback) {
        var self = this;
        return Promise.bind(this).then(function () {
            if (self._connection)
                return self._connection;
            return MongoConnectAsyc(self.url);
        }).then(function (db) {
            self._connection = db;
            return self;
        }).nodeify(callback);
    };
    /**
     * Closes the active database connection
     * @type {Promise}
     */
    Core.prototype.close = function () {
        var self = this;
        return Promise.bind(this).then(function () {
            if (!self._connection)
                return this;
            var conn = self._connection;
            self._connection = null;
            conn.close();
            return this;
        });
    };
    /**
     * Provides an express middleware which can be used to set the req.db property
     * to the current Iridium instance.
     * @returns {Iridium.ExpressMiddleware}
     */
    Core.prototype.express = function () {
        return expressMiddleware.ExpressMiddlewareFactory(this);
    };
    return Core;
})();
module.exports = Core;
//# sourceMappingURL=Core.js.map