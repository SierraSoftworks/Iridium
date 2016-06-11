"use strict";
const Bluebird = require("bluebird");
const MongoDB = require("mongodb");
const _ = require("lodash");
const Express_1 = require("./middleware/Express");
const NoOpCache_1 = require("./caches/NoOpCache");
/**
 * The Iridium Core, responsible for managing the connection to the database as well
 * as any plugins you are making use of.
 *
 * Generally you will subclass this to provide your own custom core with the models you
 * make use of within your application.
 */
class Core {
    constructor(uri, config) {
        this.mongoConnectAsyc = Bluebird.promisify(MongoDB.MongoClient.connect);
        this._plugins = [];
        this._cache = new NoOpCache_1.NoOpCache();
        let args = Array.prototype.slice.call(arguments, 0);
        uri = config = null;
        for (let i = 0; i < args.length; i++) {
            if (typeof args[i] == "string")
                uri = args[i];
            else if (typeof args[i] == "object")
                config = args[i];
        }
        if (!uri && !config)
            throw new Error("Expected either a URI or config object to be supplied when initializing Iridium");
        this._url = uri;
        this._config = config;
    }
    /**
     * Gets the plugins registered with this Iridium Core
     * @returns {[Iridium.Plugin]}
     */
    get plugins() {
        return this._plugins;
    }
    /**
     * Gets the configuration specified in the construction of this
     * Iridium Core.
     * @returns {Iridium.Configuration}
     */
    get settings() {
        return this._config;
    }
    /**
     * Gets the currently active database connection for this Iridium
     * Core.
     * @returns {MongoDB.Db}
     */
    get connection() {
        return this._connection;
    }
    /**
     * Gets the URL used to connect to MongoDB
     * @returns {String}
     */
    get url() {
        if (this._url)
            return this._url;
        let url = "mongodb://";
        if (this._config.username) {
            url += this._config.username;
            if (this._config.password)
                url += ":" + this._config.password;
            url += "@";
        }
        let hosts = [];
        if (this._config.host) {
            if (this._config.port)
                hosts.push(this._config.host + ":" + this._config.port);
            else
                hosts.push(this._config.host);
        }
        if (this._config.hosts) {
            _.each(this._config.hosts, (host) => {
                if (host.port)
                    hosts.push(host.address + ":" + host.port);
                else if (this._config.port)
                    hosts.push(host.address + ":" + this._config.port);
                else
                    hosts.push(host.address);
            });
        }
        if (hosts.length)
            url += _.uniq(hosts).join(",");
        else
            url += "localhost";
        url += "/" + this._config.database;
        return url;
    }
    /**
     * Gets the cache used to store objects retrieved from the database for performance reasons
     * @returns {cache}
     */
    get cache() {
        return this._cache;
    }
    set cache(value) {
        this._cache = value;
    }
    /**
     * Registers a new plugin with this Iridium Core
     * @param {Iridium.Plugin} plugin The plugin to register with this Iridium Core
     * @returns {Iridium.Core}
     */
    register(plugin) {
        this.plugins.push(plugin);
        return this;
    }
    /**
     * Connects to the database server specified in the provided configuration
     * @param {function(Error, Iridium.Core)} [callback] A callback to be triggered once the connection is established.
     * @returns {Promise}
     */
    connect(callback) {
        return Bluebird.resolve().then(() => {
            if (this._connection)
                return this._connection;
            if (this._connectPromise)
                return this._connectPromise;
            return this._connectPromise = this.mongoConnectAsyc(this.url, this._config && this._config.options);
        }).then((db) => {
            return this.onConnecting(db);
        }).then(db => {
            this._connection = db;
            this._connectPromise = null;
            return this.onConnected();
        }).then(() => {
            return this;
        }, (err) => {
            if (this._connection)
                this._connection.close();
            this._connection = null;
            this._connectPromise = null;
            return Bluebird.reject(err);
        }).nodeify(callback);
    }
    /**
     * Closes the active database connection
     * @type {Promise}
     */
    close() {
        return Bluebird.resolve().then(() => {
            if (!this._connection)
                return this;
            let conn = this._connection;
            this._connection = null;
            conn.close();
            return this;
        });
    }
    /**
     * Provides an express middleware which can be used to set the req.db property
     * to the current Iridium instance.
     * @returns {Iridium.ExpressMiddleware}
     */
    express() {
        return Express_1.ExpressMiddlewareFactory(this);
    }
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
    onConnecting(connection) {
        return Bluebird.resolve(connection);
    }
    /**
     * A method which is called once a database connection has been established and accepted by Iridium
     *
     * In subclassed Iridium cores this method can be overridden to perform tasks whenever a
     * connection to the database has been established - such as setting up indexes for your
     * collections or seeding the database.
     */
    onConnected() {
        return Bluebird.resolve();
    }
}
exports.Core = Core;

//# sourceMappingURL=Core.js.map
