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
                // Cache the document if caching is enabled
                if (_this.model.core.cache && options.cache && !options.fields) {
                    _this.model.cache.set(target); // Does not block execution pipeline - fire and forget
                }
                // Trigger the received hook
                if (_this.model.hooks.onRetrieved)
                    _this.model.hooks.onRetrieved(target);
                // Wrap the document and trigger the ready hook
                var wrapped = wrapper(target, false, !!options.fields);
                if (_this.model.hooks.onReady && wrapped instanceof _this.model.Instance)
                    _this.model.hooks.onReady(wrapped);
                return wrapped;
            });
        });
    };
    ModelHandlers.prototype.creatingDocuments = function (documents) {
        var _this = this;
        return Bluebird.all(documents.map(function (document) {
            return Bluebird.resolve().then(function () {
                if (_this.model.hooks.onCreating)
                    _this.model.hooks.onCreating(document);
                document = _this.model.helpers.convertToDB(document);
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
            if (_this.model.hooks.onSaving)
                _this.model.hooks.onSaving(instance, changes);
            return instance;
        });
    };
    return ModelHandlers;
})();
exports.default = ModelHandlers;

//# sourceMappingURL=../lib/ModelHandlers.js.map