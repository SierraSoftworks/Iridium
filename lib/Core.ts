/// <reference path='../typings/node/node.d.ts' />
/// <reference path='../typings/mongodb/mongodb.d.ts' />
/// <reference path='../typings/lodash/lodash.d.ts' />
/// <reference path='../typings/bluebird/bluebird.d.ts' />
/// <reference path='./Model' />
/// <reference path='./Instance' />

import Promise = require('bluebird');
import MongoDB = require('mongodb');
import _ = require('lodash');
import http = require('http');
import events = require('events');

import config = require('./Configuration');
import IPlugin = require('./Plugins');
import model = require('./Model');
import instance = require('./Instance');

import middleware = require('./Middleware');
import expressMiddleware = require('./middleware/Express');

import cache = require('./Cache');
import noOpCache = require('./caches/NoOpCache');
import memoryCache = require('./caches/MemoryCache');

var MongoConnectAsyc = Promise.promisify(MongoDB.MongoClient.connect);

export = Core;

class Core {
    private _models: { [key:string]:model.IModel<any, any>};
    private _plugins: [IPlugin];
    private _url: string;
    private _config: config.Configuration;
    private _connection: MongoDB.Db;
    private _cache: cache = new noOpCache();

    /**
     * Gets the models registered with this Iridium Core
     * @returns {{}}
     */
    get models(): { [key:string]:model.IModel<any, any> } {
        return this._models;
    }

    /**
     * Gets the plugins registered with this Iridium Core
     * @returns {[Iridium.Plugin]}
     */
    get plugins(): [IPlugin] {
        return this._plugins;
    }

    /**
     * Gets the configuration specified in the construction of this
     * Iridium Core.
     * @returns {Iridium.Configuration}
     */
    get settings(): config.Configuration {
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
        url += (this._config.host || 'localhost');
        if (this._config.port)
            url += ':' + this._config.port;

        return url;
    }

    /**
     * Gets the cache used to store objects retrieved from the database for performance reasons
     * @returns {cache}
     */
    get cache(): cache {
        return this._cache;
    }

    set cache(value: cache) {
        this._cache = value;
    }
    
    /**
     * Creates a new Iridium Core instance connected to the specified MongoDB instance
     * @param {String} url The URL of the MongoDB instance to connect to
     * @param {Iridium.IridiumConfiguration} config The config object made available as settings
     * @constructs Core
     */
    constructor(url?: string, config?: config.Configuration) {

        var args = Array.prototype.slice.call(arguments, 0);
        url = config = null;
        for(var i = 0; i < args.length; i++) {
            if(typeof args[i] == 'string')
                url = args[i];
            else if(typeof args[i] == 'object')
                config = args[i];
        }

        if(!url && !config) throw new Error("Expected either a URI or config object to be supplied when initializing Iridium");

        this._url = url;
        this._config = config;
    }

    /**
     * Registers a new plugin with this Iridium Core
     * @param {Iridium.Plugin} plugin The plugin to register with this Iridium Core
     * @returns {Iridium.Core}
     */
    register(plugin: IPlugin): Core;

    /**
     * Registers a new model with this Iridium Core
     * @param {String} name The name which this model will be registered with
     * @param {Iridium.Model} model The instantiated model to register on this Iridium Core
     * @returns {Iridium.Core}
     */
    register<TSchema, TInstance extends instance.IInstance<any, any>>(name: string, model: model.IModel<TSchema, TInstance>): Core;

    /**
     * Registers a new model with this Iridium Core
     * @param {String} name The name which this model will be registered with
     * @param {Iridium.ModelFactory} modelFactory The factory responsible for creating the model to register on this Iridium Core
     * @returns {Iridium.Core}
     */
    register<TSchema, TInstance extends instance.IInstance<any, any>>(name: string, modelFactory: model.IModelFactory<TSchema, TInstance>): Core;

    register(arg0: any, arg1?: any): Core {
        if (typeof arg0 == 'object') {
            this.plugins.push(arg0);
            return this;
        }

        if (arg1.isModel) this.models[arg0] = arg1;
        else this.models[arg0] = arg1(this);
        Object.defineProperty(this, arg0, {
            get: function () {
                return this.models[arg0];
            },
            enumerable: false
        });
        return this;
    }

    /**
     * Connects to the database server specified in the provided configuration
     * @param {function(Error, Iridium.Core)} [callback] A callback to be triggered once the connection is established.
     * @returns {Promise}
     */
    connect(callback?: (err: Error, core: Core) => any): Promise<Core> {
        var self = this;
        return Promise.bind(this).then(function() {
            if (self._connection) return self._connection;
            return MongoConnectAsyc(self.url);
        }).then(function (db: MongoDB.Db) {
            self._connection = db;
            return self;
        }).nodeify(callback);
    }

    /**
     * Closes the active database connection
     * @type {Promise}
     */
    close(): Promise<Core> {
        var self = this;
        return Promise.bind(this).then(function() {
            if (!self._connection) return this;
            var conn: MongoDB.Db = self._connection;
            self._connection = null;
            conn.close();
            return this;
        });
    }

    /**
     * Provides an express middleware which can be used to set the req.db property
     * to the current Iridium instance.
     * @returns {Iridium.ExpressMiddleware}
     */
    express(): expressMiddleware.ExpressMiddleware {
        return expressMiddleware.ExpressMiddlewareFactory(this);
    }
}
