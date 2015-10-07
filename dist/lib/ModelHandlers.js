var _ = require('lodash');
var Bluebird = require('bluebird');
/**
 * Provides a number of methods which are used to handle events that occur within
 * the Iridium workflow - such as what happens when a document is received from
 * the database, or how to handle the creation of new documents and saving of instances.
 *
 * Mostly this is for cache support, wrapping and hook triggering.
 * @internal
 */
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
exports.ModelHandlers = ModelHandlers;

//# sourceMappingURL=ModelHandlers.js.map
