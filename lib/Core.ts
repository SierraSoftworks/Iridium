import * as MongoDB from "mongodb";
import * as _ from "lodash";
import * as http from "http";
import * as events from "events";
import * as url from "url";

import {Configuration} from "./Configuration";
import {Plugin} from "./Plugins";
import {Model} from "./Model";
import {Instance} from "./Instance";

import {MiddlewareFactory} from "./Middleware";
import * as ExpressMiddleware from "./middleware/Express";
import {ExpressMiddlewareFactory} from "./middleware/Express";

import {Cache} from "./Cache";
import {NoOpCache} from "./caches/NoOpCache";
import {MemoryCache} from "./caches/MemoryCache";

import {BuildUrl} from "./utils/UrlBuilder";
import {Callback} from "./General";
import {Nodeify} from "./utils/Promise";

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
        if (typeof uri === "string") {
            this._url = uri;
            this._config = config;

            this._dbName = config && config.database || this.parseDbName(this.url)
        } else if (uri) {
            this._config = uri;
            this._dbName = uri && uri.database || "";
            if (!this._dbName) throw new Error("Expected the database name to be provided when initializing Iridium");
        } else {
            throw new Error("Expected either a URI or config object to be supplied when initializing Iridium");
        }
    }

    private mongoConnectAsyc = (url: string, opts: MongoDB.MongoClientOptions) => new Promise<MongoDB.MongoClient>((resolve, reject) => {
        MongoDB.MongoClient.connect(url, opts, (err, db) => {
            if (err) return reject(err);
            return resolve(db);
        });
    });

    private _plugins: Plugin[] = [];
    private _url: string;
    private _config: Configuration|undefined;
    private _connection: MongoDB.MongoClient|undefined;
    private _cache: Cache = new NoOpCache();
    private _dbName: string;

    private _connectPromise: Promise<MongoDB.MongoClient>|undefined;

    /**
     * Gets the plugins registered with this Iridium Core
     * @returns {Iridium.Plugin[]}
     */
    get plugins(): Plugin[] {
        return this._plugins;
    }

    /**
     * Gets the configuration specified in the construction of this
     * Iridium Core.
     * @returns {Iridium.Configuration}
     */
    get settings(): Configuration|undefined {
        return this._config;
    }

    /**
     * Gets the currently active database connection for this Iridium
     * Core.
     * @returns {MongoDB.Db}
     */
    get connection(): MongoDB.MongoClient {
        if (!this._connection) throw new Error("Iridium Core not connected to a database.");
        return this._connection;
    }

    /**
     * Gets the name of the database that this Iridium core is connected to
     */
    get dbName(): string {
        return this._dbName;
    }

    /**
     * Gets the database that this Iridium core is connected to
     */
    get db(): MongoDB.Db {
        return this.connection.db(this.dbName);
    }

    /**
     * Gets the URL used to connect to MongoDB
     * @returns {String}
     */
    get url(): string {
        if (this._url) return this._url;
        if (!this._config) throw new Error("No URL or configuration provided");

        return BuildUrl(this._config);
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
    register(plugin: Plugin): this {
        this.plugins.push(plugin);
        return this;
    }

    /**
     * Connects to the database server specified in the provided configuration
     * @param {function} [callback] A callback to be triggered once the connection is established.
     * @returns {Promise}
     */
    connect(callback?: Callback<this>): Promise<this> {
        return Nodeify(Promise.resolve().then(() => {
            if (this._connection) return this._connection;
            if (this._connectPromise) return this._connectPromise;
            return this._connectPromise = this.mongoConnectAsyc(this.url, this._config && this._config.options || {});
        }).then((db: MongoDB.MongoClient) => {
            return this.onConnecting(db);
        }).then(db => {
            this._connection = db;
            this._connectPromise = undefined;
            return this.onConnected();
        }).then(() => {
            return this;
        }, (err) => {
            if (this._connection && this._connection.close) return this._connection.close().then(() => {
                this._connection = undefined;
                this._connectPromise = undefined;
            }).then(() => Promise.reject(err));

            this._connection = undefined;
            this._connectPromise = undefined;

            return Promise.reject(err);
        }), callback);
    }

    /**
     * Closes the active database connection
     * @type {Promise}
     */
    close(callback?: Callback<this>): Promise<this> {
        return Nodeify(Promise.resolve().then(() => {
            if (!this._connection) return this;
            let conn: MongoDB.MongoClient = this._connection;
            this._connection = undefined;
            conn.close && conn.close();
            return this;
        }), callback);
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
     * @param {MongoDB.Db} connection The underlying MongoDB connection which was created, you can modify or replace this if you wish.
     * @returns A promise for the connection, allowing you to perform any asynchronous initialization required by your application.
     *
     * In subclassed Iridium Cores this method can be overridden to manipulate the properties
     * of the underlying MongoDB connection object, such as authenticating. Until this method
     * resolves a connection object, Iridium will be unable to execute any queries. If you wish
     * to run Iridium queries then look at the onConnected method.
     */
    protected onConnecting(connection: MongoDB.MongoClient): PromiseLike<MongoDB.MongoClient> {
        return Promise.resolve(connection);
    }

    /**
     * A method which is called once a database connection has been established and accepted by Iridium
     *
     * In subclassed Iridium cores this method can be overridden to perform tasks whenever a
     * connection to the database has been established - such as setting up indexes for your
     * collections or seeding the database.
     */
    protected onConnected(): PromiseLike<void> {
        return Promise.resolve();
    }

    /**
     * Parses the name of a DB from a URL string
     * @param urlStr The url string whose path component is the name of the DB
     */
    private parseDbName(urlStr: string): string {
        const path = (url.parse(urlStr).path || "").replace(/^\/*/, "");
        if (!path) throw new Error("Database URL does not include the DB name");
        if (!path.match(/^[^\.\s\/\\]*$/)) throw new Error("Database name provided in the URL is invalid");
        return path;
    }
}
