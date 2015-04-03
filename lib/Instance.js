/// <reference path='../typings/node/node.d.ts' />
/// <reference path='../typings/mongodb/mongodb.d.ts' />
/// <reference path='../typings/lodash/lodash.d.ts' />
/// <reference path='../typings/bluebird/bluebird.d.ts' />
/// <reference path="Core.ts" />
/// <reference path="Model.ts" />
var _ = require('lodash');
var Promise = require('bluebird');
var Instance = (function () {
    function Instance(model, document, isNew, isPartial) {
        if (isNew === void 0) { isNew = false; }
        if (isPartial === void 0) { isPartial = false; }
        this._model = model;
        this._isNew = !!isNew;
        this._isPartial = isPartial;
        this._original = document;
        this._modified = _.cloneDeep(document);
        _.each(model.core.plugins, function (plugin) {
            if (plugin.newInstance)
                plugin.newInstance(this, model);
        });
    }
    Object.defineProperty(Instance.prototype, "document", {
        get: function () {
            return this._modified;
        },
        enumerable: true,
        configurable: true
    });
    Instance.prototype.save = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var callback = null;
        var changes = null;
        var conditions = {};
        Array.prototype.slice.call(args, 0).reverse().forEach(function (arg) {
            if (typeof arg == 'function')
                callback = arg;
            else if (typeof arg == 'object') {
                if (!changes)
                    changes = arg;
                else
                    conditions = arg;
            }
        });
        return Promise.resolve().then(function () {
            _.merge(conditions, this._model.helpers.selectOneDownstream(this._modified));
            this._model.helpers.transform.reverse(conditions);
            if (!changes) {
                var validation = this._model.helpers.validate(this._modified);
                if (validation.failed)
                    return Promise.reject(validation.error).bind(this).nodeify(callback);
                var original = _.cloneDeep(this._original);
                var modified = _.cloneDeep(this._modified);
                changes = this._model.helpers.diff(original, modified);
            }
        }).then(function () {
            return this._model.handlers.savingDocument(this, changes);
        }).then(function () {
            return new Promise(function (resolve, reject) {
                this._model.collection.update(conditions, changes, { w: 1 }, function (err, changed) {
                    if (err)
                        return reject(err);
                    return resolve(changed);
                });
            });
        }).then(function (changed) {
            conditions = this._model.helpers.selectOne(this.modified);
            if (!changed)
                return this._modified;
            return new Promise(function (resolve, reject) {
                this._model.collection.findOne(conditions, function (err, latest) {
                    if (err)
                        return reject(err);
                    return resolve(latest);
                });
            });
        }).then(function (latest) {
            return this._model.handlers.documentsReceived(conditions, [latest], function (value) {
                this._model.helpers.transform.apply(value);
                this._isPartial = false;
                this._isNew = false;
                this._original = value;
                this._modified = _.clone(value);
                return this;
            });
        }).nodeify(callback);
    };
    Instance.prototype.update = function (callback) {
        return this.refresh(callback);
    };
    Instance.prototype.refresh = function (callback) {
        var conditions = this._model.helpers.selectOne(this._original);
        return Promise.resolve().then(function () {
            return new Promise(function (resolve, reject) {
                this._model.collection.findOne(conditions, function (err, doc) {
                    if (err)
                        return reject(err);
                    return resolve(doc);
                });
            });
        }).then(function (doc) {
            if (!doc) {
                this._isPartial = true;
                this._isNew = true;
                this._original = _.cloneDeep(this._modified);
                return this;
            }
            return this._model.handle.documentsReceived(conditions, [doc], this._model.helpers.transform.apply, { wrap: false }).then(function (doc) {
                this._model.helpers.transformFromSource(doc);
                this._isNew = false;
                this._isPartial = false;
                this._original = doc;
                this._modified = _.cloneDeep(doc);
                this._model._helpers.transformDown(doc);
                return this;
            });
        }).nodeify(callback);
    };
    Instance.prototype.delete = function (callback) {
        return this.remove(callback);
    };
    Instance.prototype.remove = function (callback) {
        var conditions = this._model.helpers.selectOne(this._original);
        return Promise.resolve().then(function () {
            if (this._isNew)
                return 0;
            return new Promise(function (resolve, reject) {
                this._model.collection.remove(conditions, function (err, removed) {
                    if (err)
                        return reject(err);
                    return resolve(removed);
                });
            });
        }).then(function (removed) {
            if (removed)
                return this._model.cache.remove(conditions);
        }).nodeify(callback);
    };
    Instance.prototype.first = function (collection, predicate) {
        var result = null;
        _.each(collection, function (value, key) {
            if (predicate.call(this, value, key)) {
                result = value;
                return false;
            }
        }, this);
        return result;
    };
    Instance.prototype.select = function (collection, predicate) {
        var isArray = Array.isArray(collection);
        var results = isArray ? [] : {};
        _.each(collection, function (value, key) {
            if (predicate.call(this, value, key)) {
                if (isArray)
                    results.push(value);
                else
                    results[key] = value;
            }
        }, this);
        return results;
    };
    return Instance;
})();
exports.Instance = Instance;
//# sourceMappingURL=Instance.js.map