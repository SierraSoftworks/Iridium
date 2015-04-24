/// <reference path="../_references.d.ts" />
import Promise = require('bluebird');
import MongoDB = require('mongodb');
import config = require('./Configuration');
import IPlugin = require('./Plugins');
import expressMiddleware = require('./middleware/Express');
import cache = require('./Cache');
export = Core;
declare class Core {
    private _plugins;
    private _url;
    private _config;
    private _connection;
    private _cache;
    /**
     * Gets the plugins registered with this Iridium Core
     * @returns {[Iridium.Plugin]}
     */
    plugins: IPlugin[];
    /**
     * Gets the configuration specified in the construction of this
     * Iridium Core.
     * @returns {Iridium.Configuration}
     */
    settings: config;
    /**
     * Gets the currently active database connection for this Iridium
     * Core.
     * @returns {MongoDB.Db}
     */
    connection: MongoDB.Db;
    /**
     * Gets the URL used to connect to MongoDB
     * @returns {String}
     */
    url: string;
    /**
     * Gets the cache used to store objects retrieved from the database for performance reasons
     * @returns {cache}
     */
    cache: cache;
    /**
     * Creates a new Iridium Core instance connected to the specified MongoDB instance
     * @param {Iridium.IridiumConfiguration} config The config object defining the database to connect to
     * @constructs Core
     */
    constructor(config: config);
    /**
     * Creates a new Iridium Core instance connected to the specified MongoDB instance
     * @param {String} url The URL of the MongoDB instance to connect to
     * @param {Iridium.IridiumConfiguration} config The config object made available as settings
     * @constructs Core
     */
    constructor(uri: string, config?: config);
    /**
     * Registers a new plugin with this Iridium Core
     * @param {Iridium.Plugin} plugin The plugin to register with this Iridium Core
     * @returns {Iridium.Core}
     */
    register(plugin: IPlugin): Core;
    /**
     * Connects to the database server specified in the provided configuration
     * @param {function(Error, Iridium.Core)} [callback] A callback to be triggered once the connection is established.
     * @returns {Promise}
     */
    connect(callback?: (err: Error, core: Core) => any): Promise<Core>;
    /**
     * Closes the active database connection
     * @type {Promise}
     */
    close(): Promise<Core>;
    /**
     * Provides an express middleware which can be used to set the req.db property
     * to the current Iridium instance.
     * @returns {Iridium.ExpressMiddleware}
     */
    express(): expressMiddleware.ExpressMiddleware;
}
