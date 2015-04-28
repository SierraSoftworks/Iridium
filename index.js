/// <reference path="./_references.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _Core = require('./lib/Core');
var _Model = require('./lib/Model');
var _Instance = require('./lib/Instance');
var _MemoryCache = require('./lib/caches/MemoryCache');
var _NoOpCache = require('./lib/caches/NoOpCache');
var _IDDirector = require('./lib/cacheControllers/IDDirector');
var Iridium;
(function (Iridium) {
    var Core = (function (_super) {
        __extends(Core, _super);
        function Core() {
            _super.apply(this, arguments);
        }
        return Core;
    })(_Core);
    Iridium.Core = Core;
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model() {
            _super.apply(this, arguments);
        }
        return Model;
    })(_Model);
    Iridium.Model = Model;
    var Instance = (function (_super) {
        __extends(Instance, _super);
        function Instance() {
            _super.apply(this, arguments);
        }
        return Instance;
    })(_Instance);
    Iridium.Instance = Instance;
    var NoOpCache = (function (_super) {
        __extends(NoOpCache, _super);
        function NoOpCache() {
            _super.apply(this, arguments);
        }
        return NoOpCache;
    })(_NoOpCache);
    Iridium.NoOpCache = NoOpCache;
    var MemoryCache = (function (_super) {
        __extends(MemoryCache, _super);
        function MemoryCache() {
            _super.apply(this, arguments);
        }
        return MemoryCache;
    })(_MemoryCache);
    Iridium.MemoryCache = MemoryCache;
    var CacheOnID = (function (_super) {
        __extends(CacheOnID, _super);
        function CacheOnID() {
            _super.apply(this, arguments);
        }
        return CacheOnID;
    })(_IDDirector);
    Iridium.CacheOnID = CacheOnID;
})(Iridium || (Iridium = {}));
module.exports = Iridium;
//# sourceMappingURL=index.js.map