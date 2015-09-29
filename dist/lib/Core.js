var Bluebird = require('bluebird');
var MongoDB = require('mongodb');
var _ = require('lodash');
var Express_1 = require('./middleware/Express');
var NoOpCache_1 = require('./caches/NoOpCache');
/**
 * The Iridium Core, responsible for managing the connection to the database as well
 * as any plugins you are making use of.
 *
 * Generally you will subclass this to provide your own custom core with the models you
 * make use of within your application.
 */
var Core = (function () {
    function Core(uri, config) {
        this.mongoConnectAsyc = Bluebird.promisify(MongoDB.MongoClient.connect);
        this._plugins = [];
        this._cache = new NoOpCache_1.NoOpCache();
        var args = Array.prototype.slice.call(arguments, 0);
        uri = config = null;
        for (var i = 0; i < args.length; i++) {
            if (typeof args[i] == 'string')
                uri = args[i];
            else if (typeof args[i] == 'object')
                config = args[i];
        }
        if (!uri && !config)
            throw new Error("Expected either a URI or config object to be supplied when initializing Iridium");
        this._url = uri;
        this._config = config;
    }
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
            var _this = this;
            if (this._url)
                return this._url;
            var url = 'mongodb://';
            if (this._config.username) {
                url += this._config.username;
                if (this._config.password)
                    url += ':' + this._config.password;
                url += '@';
            }
            var hosts = [];
            if (this._config.host) {
                if (this._config.port)
                    hosts.push(this._config.host + ':' + this._config.port);
                else
                    hosts.push(this._config.host);
            }
            if (this._config.hosts) {
                _.each(this._config.hosts, function (host) {
                    if (host.port)
                        hosts.push(host.address + ':' + host.port);
                    else if (_this._config.port)
                        hosts.push(host.address + ':' + _this._config.port);
                    else
                        hosts.push(host.address);
                });
            }
            if (hosts.length)
                url += _.uniq(hosts).join(',');
            else
                url += 'localhost';
            url += '/' + this._config.database;
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
    /**
     * Registers a new plugin with this Iridium Core
     * @param {Iridium.Plugin} plugin The plugin to register with this Iridium Core
     * @returns {Iridium.Core}
     */
    Core.prototype.register = function (plugin) {
        this.plugins.push(plugin);
        return this;
    };
    /**
     * Connects to the database server specified in the provided configuration
     * @param {function(Error, Iridium.Core)} [callback] A callback to be triggered once the connection is established.
     * @returns {Promise}
     */
    Core.prototype.connect = function (callback) {
        var _this = this;
        return Bluebird.bind(this).then(function () {
            if (_this._connection)
                return _this._connection;
            if (_this._connectPromise)
                return _this._connectPromise;
            return _this._connectPromise = _this.mongoConnectAsyc(_this.url);
        }).then(function (db) {
            return _this.onConnecting(db);
        }).then(function (db) {
            _this._connection = db;
            _this._connectPromise = null;
            return _this.onConnected();
        }).then(function () {
            return _this;
        }, function (err) {
            if (_this._connection)
                _this._connection.close();
            _this._connection = null;
            _this._connectPromise = null;
            return Bluebird.reject(err);
        }).nodeify(callback);
    };
    /**
     * Closes the active database connection
     * @type {Promise}
     */
    Core.prototype.close = function () {
        var _this = this;
        return Bluebird.bind(this).then(function () {
            if (!_this._connection)
                return _this;
            var conn = _this._connection;
            _this._connection = null;
            conn.close();
            return _this;
        });
    };
    /**
     * Provides an express middleware which can be used to set the req.db property
     * to the current Iridium instance.
     * @returns {Iridium.ExpressMiddleware}
     */
    Core.prototype.express = function () {
        return Express_1.ExpressMiddlewareFactory(this);
    };
    /**
     * A method which is called whenever a new connection is made to the database.
     *
     * @param connection The underlying MongoDB connection which was created, you can modify or replace this if you wish.
     * @returns A promise for the connection, allowing you to perform any asynchronous initialization required by your application.
     *
     * In subclassed Iridium Cores this method can be overridden to manipulate the properties
     * of the underlying MongoDB connection object, such as authenticating. Until this method
     * resolves a connection object, Iridium will be unable to execute any queries. If you wish
     * to run Iridium queries then look at the onConnected method.
     */
    Core.prototype.onConnecting = function (connection) {
        return Bluebird.resolve(connection);
    };
    /**
     * A method which is called once a database connection has been established and accepted by Iridium
     *
     * In subclassed Iridium cores this method can be overridden to perform tasks whenever a
     * connection to the database has been established - such as setting up indexes for your
     * collections or seeding the database.
     */
    Core.prototype.onConnected = function () {
        return Bluebird.resolve();
    };
    return Core;
})();
exports.Core = Core;

//# sourceMappingURL=Core.js.map
