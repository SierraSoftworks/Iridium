import * as MongoDB from "mongodb";
import { Configuration } from "./Configuration";
import { Plugin } from "./Plugins";
import * as ExpressMiddleware from "./middleware/Express";
import { Cache } from "./Cache";
import { Callback } from "./General";
/**
 * The Iridium Core, responsible for managing the connection to the database as well
 * as any plugins you are making use of.
 *
 * Generally you will subclass this to provide your own custom core with the models you
 * make use of within your application.
 */
export declare class Core {
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
    private mongoConnectAsyc;
    private _plugins;
    private _url;
    private _config;
    private _connection;
    private _cache;
    private _dbName;
    private _connectPromise;
    /**
     * Gets the plugins registered with this Iridium Core
     * @returns {Iridium.Plugin[]}
     */
    readonly plugins: Plugin[];
    /**
     * Gets the configuration specified in the construction of this
     * Iridium Core.
     * @returns {Iridium.Configuration}
     */
    readonly settings: Configuration | undefined;
    /**
     * Gets the currently active database connection for this Iridium
     * Core.
     * @returns {MongoDB.Db}
     */
    readonly connection: MongoDB.MongoClient;
    /**
     * Gets the name of the database that this Iridium core is connected to
     */
    readonly dbName: string;
    /**
     * Gets the database that this Iridium core is connected to
     */
    readonly db: MongoDB.Db;
    /**
     * Gets the URL used to connect to MongoDB
     * @returns {String}
     */
    readonly url: string;
    /**
     * Gets the cache used to store objects retrieved from the database for performance reasons
     * @returns {cache}
     */
    cache: Cache;
    /**
     * Registers a new plugin with this Iridium Core
     * @param {Iridium.Plugin} plugin The plugin to register with this Iridium Core
     * @returns {Iridium.Core}
     */
    register(plugin: Plugin): this;
    /**
     * Connects to the database server specified in the provided configuration
     * @param {function} [callback] A callback to be triggered once the connection is established.
     * @returns {Promise}
     */
    connect(callback?: Callback<this>): Promise<this>;
    /**
     * Closes the active database connection
     * @type {Promise}
     */
    close(callback?: Callback<this>): Promise<this>;
    /**
     * Provides an express middleware which can be used to set the req.db property
     * to the current Iridium instance.
     * @returns {Iridium.ExpressMiddleware}
     */
    express(): ExpressMiddleware.ExpressMiddleware;
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
    protected onConnecting(connection: MongoDB.MongoClient): PromiseLike<MongoDB.MongoClient>;
    /**
     * A method which is called once a database connection has been established and accepted by Iridium
     *
     * In subclassed Iridium cores this method can be overridden to perform tasks whenever a
     * connection to the database has been established - such as setting up indexes for your
     * collections or seeding the database.
     */
    protected onConnected(): PromiseLike<void>;
    /**
     * Parses the name of a DB from a URL string
     * @param urlStr The url string whose path component is the name of the DB
     */
    private parseDbName(urlStr);
}
