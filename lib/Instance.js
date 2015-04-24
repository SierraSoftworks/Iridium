var _ = require('lodash');
var Promise = require('bluebird');
var Instance = (function () {
    /**
     * Creates a new instance which represents the given document as a type of model
     * @param {model.Model} model The model that the document represents
     * @param {TSchema} document The document which should be wrapped by this instance
     * @param {Boolean} isNew Whether the document is new (doesn't exist in the database) or not
     * @param {Boolean} isPartial Whether the document has only a subset of its fields populated
     * @description
     * This class will be subclassed automatically by Iridium to create a model specific instance
     * which takes advantage of some of v8's optimizations to boost performance significantly.
     * The instance returned by the model, and all of this instance's methods, will be of type
     * TInstance - which should represent the merger of TSchema and IInstance for best results.
     */
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
        /**
         * Gets the underlying document representation of this instance
         */
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
        return Promise.resolve().then(function () {
            _.merge(conditions, _this._model.helpers.selectOneDownstream(_this._modified));
            _this._model.helpers.transform.reverse(conditions);
            if (!changes) {
                var validation = _this._model.helpers.validate(_this._modified);
                if (validation.failed)
                    return Promise.reject(validation.error).bind(_this).nodeify(callback);
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
                return new Promise(function (resolve, reject) {
                    _this._model.collection.insert(_this._modified, function (err, doc) {
                        if (err)
                            return reject(err);
                        return resolve(!!doc);
                    });
                });
            return new Promise(function (resolve, reject) {
                _this._model.collection.update(conditions, changes, { w: 1 }, function (err, changed) {
                    if (err)
                        return reject(err);
                    return resolve(changed);
                });
            });
        }).then(function (changed) {
            conditions = _this._model.helpers.selectOne(_this._modified);
            if (!changed) {
                var document = _.cloneDeep(_this._modified);
                _this._model.helpers.transform.reverse(document);
                return document;
            }
            return new Promise(function (resolve, reject) {
                _this._model.collection.findOne(conditions, function (err, latest) {
                    if (err)
                        return reject(err);
                    return resolve(latest);
                });
            });
        }).then(function (latest) {
            return _this._model.handlers.documentReceived(conditions, latest, function (value) {
                _this._model.helpers.transform.apply(value);
                _this._isPartial = false;
                _this._isNew = false;
                _this._original = value;
                _this._modified = _.clone(value);
                return _this;
            });
        }).nodeify(callback);
    };
    /**
     * Updates this instance to match the latest document available in the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the update completes
     * @returns {Promise<TInstance>}
     */
    Instance.prototype.update = function (callback) {
        return this.refresh(callback);
    };
    /**
     * Updates this instance to match the latest document available in the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the update completes
     * @returns {Promise<TInstance>}
     */
    Instance.prototype.refresh = function (callback) {
        var _this = this;
        var conditions = this._model.helpers.selectOne(this._original);
        return Promise.resolve().then(function () {
            return new Promise(function (resolve, reject) {
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
                _this._model.helpers.transform.apply(doc);
                return doc;
            }).then(function (doc) {
                _this._isNew = false;
                _this._isPartial = false;
                _this._original = doc;
                _this._modified = _.cloneDeep(doc);
                return _this;
            });
        }).nodeify(callback);
    };
    /**
     * Removes this instance's document from the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    Instance.prototype.delete = function (callback) {
        return this.remove(callback);
    };
    /**
     * Removes this instance's document from the backing collection
     * @param {function(Error, IInstance)} callback A callback which is triggered when the operation completes
     * @returns {Promise<TInstance>}
     */
    Instance.prototype.remove = function (callback) {
        var _this = this;
        var conditions = this._model.helpers.selectOne(this._original);
        return Promise.resolve().then(function () {
            if (_this._isNew)
                return 0;
            return new Promise(function (resolve, reject) {
                _this._model.collection.remove(conditions, function (err, removed) {
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
    /**
     * Gets the JSON representation of this instance
     * @returns {TDocument}
     */
    Instance.prototype.toJSON = function () {
        return this.document;
    };
    /**
     * Gets a string representation of this instance
     * @returns {String}
     */
    Instance.prototype.toString = function () {
        return JSON.stringify(this.document, null, 2);
    };
    return Instance;
})();
module.exports = Instance;
//# sourceMappingURL=Instance.js.map