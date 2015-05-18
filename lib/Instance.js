var _ = require('lodash');
var Bluebird = require('bluebird');
var Instance = (function () {
    function Instance(model, document, isNew, isPartial) {
        var _this = this;
        if (isNew === void 0) { isNew = true; }
        if (isPartial === void 0) { isPartial = false; }
        this._model = model;
        this._isNew = !!isNew;
        this._isPartial = isPartial;
        this._original = document;
        this._modified = _.cloneDeep(document);
        _.each(model.core.plugins, function (plugin) {
            if (plugin.newInstance)
                plugin.newInstance(_this, model);
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
        var _this = this;
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
        return Bluebird.resolve().then(function () {
            _.merge(conditions, { _id: _this._modified._id });
            if (!changes) {
                var validation = _this._model.helpers.validate(_this._modified);
                if (validation.failed)
                    return Bluebird.reject(validation.error).bind(_this).nodeify(callback);
                var original = _.cloneDeep(_this._original);
                var modified = _.cloneDeep(_this._modified);
                changes = _this._model.helpers.diff(original, modified);
            }
            if (!_.keys(changes).length)
                return null;
            return changes;
        }).then(function (changes) {
            if (!changes && !_this._isNew)
                return changes;
            return _this._model.handlers.savingDocument(_this, changes).then(function () { return changes; });
        }).then(function (changes) {
            if (!changes && !_this._isNew)
                return false;
            if (_this._isNew)
                return new Bluebird(function (resolve, reject) {
                    _this._model.collection.insertOne(_this._modified, { w: 'majority' }, function (err, doc) {
                        if (err)
                            return reject(err);
                        return resolve(!!doc);
                    });
                });
            return new Bluebird(function (resolve, reject) {
                _this._model.collection.updateOne(conditions, changes, { w: 'majority' }, function (err, changed) {
                    if (err)
                        return reject(err);
                    return resolve(changed);
                });
            });
        }).then(function (changed) {
            conditions = { _id: _this._modified._id };
            if (!changed) {
                return _.cloneDeep(_this._modified);
            }
            return new Bluebird(function (resolve, reject) {
                _this._model.collection.findOne(conditions, function (err, latest) {
                    if (err)
                        return reject(err);
                    return resolve(latest);
                });
            });
        }).then(function (latest) {
            return _this._model.handlers.documentReceived(conditions, latest, function (value) {
                _this._isPartial = false;
                _this._isNew = false;
                _this._original = value;
                _this._modified = _.clone(value);
                return _this;
            });
        }).nodeify(callback);
    };
    Instance.prototype.update = function (callback) {
        return this.refresh(callback);
    };
    Instance.prototype.refresh = function (callback) {
        var _this = this;
        var conditions = { _id: this._original._id };
        return Bluebird.resolve().then(function () {
            return new Bluebird(function (resolve, reject) {
                _this._model.collection.findOne(conditions, function (err, doc) {
                    if (err)
                        return reject(err);
                    return resolve(doc);
                });
            });
        }).then(function (newDocument) {
            if (!newDocument) {
                _this._isPartial = true;
                _this._isNew = true;
                _this._original = _.cloneDeep(_this._modified);
                return _this;
            }
            return _this._model.handlers.documentReceived(conditions, newDocument, function (doc) {
                _this._isNew = false;
                _this._isPartial = false;
                _this._original = doc;
                _this._modified = _.cloneDeep(doc);
                return _this;
            });
        }).nodeify(callback);
    };
    Instance.prototype.delete = function (callback) {
        return this.remove(callback);
    };
    Instance.prototype.remove = function (callback) {
        var _this = this;
        var conditions = { _id: this._original._id };
        return Bluebird.resolve().then(function () {
            if (_this._isNew)
                return 0;
            return new Bluebird(function (resolve, reject) {
                _this._model.collection.remove(conditions, { w: 'majority' }, function (err, removed) {
                    if (err)
                        return reject(err);
                    return resolve(removed);
                });
            });
        }).then(function (removed) {
            if (removed)
                return _this._model.cache.clear(conditions);
            return false;
        }).then(function (removed) {
            _this._isNew = true;
            return _this;
        }).nodeify(callback);
    };
    Instance.prototype.first = function (collection, predicate) {
        var _this = this;
        var result = null;
        _.each(collection, function (value, key) {
            if (predicate.call(_this, value, key)) {
                result = value;
                return false;
            }
        });
        return result;
    };
    Instance.prototype.select = function (collection, predicate) {
        var _this = this;
        var isArray = Array.isArray(collection);
        var results = isArray ? [] : {};
        _.each(collection, function (value, key) {
            if (predicate.call(_this, value, key)) {
                if (isArray)
                    results.push(value);
                else
                    results[key] = value;
            }
        });
        return results;
    };
    Instance.prototype.toJSON = function () {
        return this.document;
    };
    Instance.prototype.toString = function () {
        return JSON.stringify(this.document, null, 2);
    };
    return Instance;
})();
module.exports = Instance;
//# sourceMappingURL=Instance.js.map