var Bluebird = require('bluebird');
var MongoDB = require('mongodb');
var _ = require('lodash');
var ExpressMiddleware = require('./middleware/Express');
var NoOpCache = require('./caches/NoOpCache');
var MongoConnectAsyc = Bluebird.promisify(MongoDB.MongoClient.connect);
var Core = (function () {
    function Core(uri, config) {
        this._plugins = [];
        this._cache = new NoOpCache();
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
        get: function () {
            return this._plugins;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Core.prototype, "settings", {
        get: function () {
            return this._config;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Core.prototype, "connection", {
        get: function () {
            return this._connection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Core.prototype, "url", {
        get: function () {
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
        get: function () {
            return this._cache;
        },
        set: function (value) {
            this._cache = value;
        },
        enumerable: true,
        configurable: true
    });
    Core.prototype.register = function (plugin) {
        this.plugins.push(plugin);
        return this;
    };
    Core.prototype.connect = function (callback) {
        var self = this;
        return Bluebird.bind(this).then(function () {
            if (self._connection)
                return self._connection;
            return MongoConnectAsyc(self.url);
        }).then(function (db) {
            self._connection = db;
            return self;
        }).nodeify(callback);
    };
    Core.prototype.close = function () {
        var self = this;
        return Bluebird.bind(this).then(function () {
            if (!self._connection)
                return this;
            var conn = self._connection;
            self._connection = null;
            conn.close();
            return this;
        });
    };
    Core.prototype.express = function () {
        return ExpressMiddleware.ExpressMiddlewareFactory(this);
    };
    return Core;
})();
module.exports = Core;
//# sourceMappingURL=Core.js.map