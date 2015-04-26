var _ = require('lodash');
var Bluebird = require('bluebird');
var ModelHandlers = (function () {
    function ModelHandlers(model) {
        this.model = model;
    }
    ModelHandlers.prototype.documentReceived = function (conditions, result, wrapper, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        _.defaults(options, {
            cache: true,
            partial: false
        });
        return Bluebird.resolve(result).then(function (target) {
            return Bluebird.resolve().then(function () {
                // Trigger the received hook
                if (_this.model.options.hooks.retrieved)
                    return _this.model.options.hooks.retrieved(target);
            }).then(function () {
                // Cache the document if caching is enabled
                if (_this.model.core.cache && options.cache && !options.fields) {
                    var cacheDoc = _.cloneDeep(target);
                    return _this.model.cache.set(cacheDoc);
                }
            }).then(function () {
                // Wrap the document and trigger the ready hook
                var wrapped = wrapper(target, false, !!options.fields);
                if (_this.model.options.hooks.ready && wrapped instanceof _this.model.Instance)
                    return Bluebird.resolve(_this.model.options.hooks.ready(wrapped)).then(function () { return wrapped; });
                return wrapped;
            });
        });
    };
    ModelHandlers.prototype.creatingDocuments = function (documents) {
        var _this = this;
        return Bluebird.all(documents.map(function (document) {
            return Bluebird.resolve().then(function () {
                if (_this.model.options.hooks.retrieved)
                    return _this.model.options.hooks.creating(document);
            }).then(function () {
                var validation = _this.model.helpers.validate(document);
                if (validation.failed)
                    return Bluebird.reject(validation.error);
                return document;
            });
        }));
    };
    ModelHandlers.prototype.savingDocument = function (instance, changes) {
        var _this = this;
        return Bluebird.resolve().then(function () {
            if (_this.model.options.hooks.saving)
                return _this.model.options.hooks.saving(instance, changes);
        }).then(function () { return instance; });
    };
    return ModelHandlers;
})();
module.exports = ModelHandlers;
//# sourceMappingURL=ModelHandlers.js.map