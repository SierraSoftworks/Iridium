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
                if (_this.model.options.hooks.retrieved)
                    _this.model.options.hooks.retrieved(target);
                if (_this.model.core.cache && options.cache && !options.fields) {
                    _this.model.cache.set(target);
                }
                var wrapped = wrapper(target, false, !!options.fields);
                if (_this.model.options.hooks.ready && wrapped instanceof _this.model.Instance)
                    _this.model.options.hooks.ready(wrapped);
                return wrapped;
            });
        });
    };
    ModelHandlers.prototype.creatingDocuments = function (documents) {
        var _this = this;
        return Bluebird.all(documents.map(function (document) {
            return Bluebird.resolve().then(function () {
                if (_this.model.options.hooks.retrieved)
                    _this.model.options.hooks.creating(document);
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
                _this.model.options.hooks.saving(instance, changes);
            return instance;
        });
    };
    return ModelHandlers;
})();
module.exports = ModelHandlers;
//# sourceMappingURL=ModelHandlers.js.map