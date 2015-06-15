function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var Core_1 = require('./lib/Core');
exports.Core = Core_1.default;
var Model_1 = require('./lib/Model');
exports.Model = Model_1.default;
var Instance_1 = require('./lib/Instance');
exports.Instance = Instance_1.default;
__export(require('./lib/Decorators'));
__export(require('./lib/Plugins'));
__export(require('./lib/Schema'));
__export(require('./lib/Cache'));
__export(require('./lib/CacheDirector'));
__export(require('./lib/ModelOptions'));
__export(require('./lib/Configuration'));
__export(require('./lib/Hooks'));
var MemoryCache_1 = require('./lib/caches/MemoryCache');
exports.MemoryCache = MemoryCache_1.default;
var NoOpCache_1 = require('./lib/caches/NoOpCache');
exports.NoOpCache = NoOpCache_1.default;
var IDDirector_1 = require('./lib/cacheControllers/IDDirector');
exports.CacheOnID = IDDirector_1.default;

//# sourceMappingURL=index.js.map