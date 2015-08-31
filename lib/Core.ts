/// <reference path="../_references.d.ts" />
import Bluebird = require('bluebird');
import MongoDB = require('mongodb');
import _ = require('lodash');
import http = require('http');
import events = require('events');

import {Configuration} from './Configuration';
import {Plugin} from './Plugins';
import {Model} from './Model';
import {Instance} from './Instance';

import {MiddlewareFactory} from './Middleware';
import * as ExpressMiddleware from './middleware/Express';
import {ExpressMiddlewareFactory} from './middleware/Express';

import {Cache} from './Cache';
import {NoOpCache} from './caches/NoOpCache';
import {MemoryCache} from './caches/MemoryCache';

/**
 * The Iridium Core, responsible for managing the connection to the database as well
 * as any plugins you are making use of.
 *
 * Generally you will subclass this to provide your own custom core with the models you
 * make use of within your application.
 */
export class Core {
    /**
     * Creates a new Iridium Core instance connected to the specified MongoDB instance
     * @param {Iridium.IridiumConfiguration} config The config object defining the database to connect to
     * @constructs Core
     */
    constructor(config: Configuration);
    /**
     * Creates a new Iridium Core instance connected to the specified MongoDB instance
     * @param {String} url The URL of the MongoDB instance to connect to
     * @param {Iridium.IridiumConfiguration} config The config object made available as settings
     * @constructs Core
     */
    constructor(uri: string, config?: Configuration);
    constructor(uri: string | Configuration, config?: Configuration) {

        var args = Array.prototype.slice.call(arguments, 0);
        uri = config = null;
        for (var i = 0; i < args.length; i++) {
            if (typeof args[i] == 'string')
                uri = args[i];
            else if (typeof args[i] == 'object')
                config = args[i];
        }

        if (!uri && !config) throw new Error("Expected either a URI or config object to be supplied when initializing Iridium");

        this._url = <string>uri;
        this._config = config;
    }

    private mongoConnectAsyc = Bluebird.promisify(MongoDB.MongoClient.connect);

    private _plugins: Plugin[] = [];
    private _url: string;
    private _config: Configuration;
    private _connection: MongoDB.Db;
    private _cache: Cache = new NoOpCache();

    private _connectPromise: Bluebird<MongoDB.Db>;

    /**
     * Gets the plugins registered with this Iridium Core
     * @returns {[Iridium.Plugin]}
     */
    get plugins(): Plugin[] {
        return this._plugins;
    }

    /**
     * Gets the configuration specified in the construction of this
     * Iridium Core.
     * @returns {Iridium.Configuration}
     */
    get settings(): Configuration {
        return this._config;
    }

    /**
     * Gets the currently active database connection for this Iridium
     * Core.
     * @returns {MongoDB.Db}
     */
    get connection(): MongoDB.Db {
        return this._connection;
    }

    /**
     * Gets the URL used to connect to MongoDB
     * @returns {String}
     */
    get url(): string {
        if (this._url) return this._url;
        var url: string = 'mongodb://';

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
            _.each(this._config.hosts, (host) => {
                if (host.port)
                    hosts.push(host.address + ':' + host.port);
                else if(this._config.port)
                    hosts.push(host.address + ':' + this._config.port);
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
    }

    /**
     * Gets the cache used to store objects retrieved from the database for performance reasons
     * @returns {cache}
     */
    get cache(): Cache {
        return this._cache;
    }

    set cache(value: Cache) {
        this._cache = value;
    }

    /**
     * Registers a new plugin with this Iridium Core
     * @param {Iridium.Plugin} plugin The plugin to register with this Iridium Core
     * @returns {Iridium.Core}
     */
    register(plugin: Plugin): Core {
        this.plugins.push(plugin);
        return this;
    }

    /**
     * Connects to the database server specified in the provided configuration
     * @param {function(Error, Iridium.Core)} [callback] A callback to be triggered once the connection is established.
     * @returns {Promise}
     */
    connect(callback?: (err: Error, core: Core) => any): Bluebird<Core> {
        return Bluebird.bind(this).then(() => {
            if (this._connection) return this._connection;
            if (this._connectPromise) return this._connectPromise;
            return this._connectPromise = this.mongoConnectAsyc(this.url);
        }).then((db: MongoDB.Db) => {
            return this.onConnecting(db);
        }).then(db => {
            this._connection = db;
            this._connectPromise = null;
            return this.onConnected();
        }).then(() => {
            return this;
        }, (err) => {
            if (this._connection) this._connection.close();
            this._connection = null;
            this._connectPromise = null;
            return Bluebird.reject(err);
        }).nodeify(callback);
    }

    /**
     * Closes the active database connection
     * @type {Promise}
     */
    close(): Bluebird<Core> {
        return Bluebird.bind(this).then(() => {
            if (!this._connection) return this;
            var conn: MongoDB.Db = this._connection;
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
    express(): ExpressMiddleware.ExpressMiddleware {
        return ExpressMiddlewareFactory(this);
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
    protected onConnecting(connection: MongoDB.Db): Bluebird<MongoDB.Db> {
        return Bluebird.resolve(connection);
    }

    /**
     * A method which is called once a database connection has been established and accepted by Iridium
     *
     * In subclassed Iridium cores this method can be overridden to perform tasks whenever a
     * connection to the database has been established - such as setting up indexes for your
     * collections or seeding the database.
     */
    protected onConnected(): Bluebird<void> {
        return Bluebird.resolve();
    }
}
