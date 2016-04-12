"use strict";
var Validators_1 = require("./Validators");
var _ = require("lodash");
var Bluebird = require("bluebird");
/**
 * The default Iridium Instance implementation which provides methods for saving, refreshing and
 * removing the wrapped document from the collection, as well as integrating with Omnom, our
 * built in document diff processor which allows clean, atomic, document updates to be performed
 * without needing to write the update queries yourself.
 *
 * @param TDocument The interface representing the structure of the documents in the collection.
 * @param TInstance The type of instance which wraps the documents, generally the subclass of this class.
 *
 * This class will be subclassed automatically by Iridium to create a model specific instance
 * which takes advantage of some of v8's optimizations to boost performance significantly.
 * The instance returned by the model, and all of this instance's methods, will be of type
 * TInstance - which should represent the merger of TSchema and IInstance for best results.
 */
var Instance = (function () {
    /**
     * Creates a new instance which represents the given document as a type of model
     * @param model The model that dictates the collection the document originated from as well as how validations are performed.
     * @param document The document which should be wrapped by this instance
     * @param isNew Whether the document is new (doesn't exist in the database) or not
     * @param isPartial Whether the document has only a subset of its fields populated
     *
     */
    function Instance(model, document, isNew, isPartial) {
        var _this = this;
        if (isNew === void 0) { isNew = true; }
        if (isPartial === void 0) { isPartial = false; }
        this._model = model;
        this._isNew = !!isNew;
        this._isPartial = isPartial;
        this._original = document;
        this._modified = model.helpers.cloneDocument(document);
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
            if (typeof arg == "function")
                callback = arg;
            else if (typeof arg == "object") {
                if (!changes)
                    changes = arg;
                else
                    conditions = arg;
            }
        });
        return Bluebird.resolve().then(function () {
            conditions = _this._model.helpers.cloneConditions(conditions);
            _.merge(conditions, { _id: _this._modified._id });
            if (!changes) {
                var validation = _this._model.helpers.validate(_this._modified);
                if (validation.failed)
                    return Bluebird.reject(validation.error).bind(_this).nodeify(callback);
                var original = _this._model.helpers.cloneDocument(_this._original);
                var modified = _this._model.helpers.cloneDocument(_this._modified);
                modified = _this._model.helpers.transformToDB(modified, { document: true });
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
            if (_this._isNew) {
                return new Bluebird(function (resolve, reject) {
                    _this._model.collection.insertOne(_this._modified, { w: "majority" }, function (err, doc) {
                        if (err)
                            return reject(err);
                        return resolve(!!doc);
                    });
                });
            }
            else {
                return new Bluebird(function (resolve, reject) {
                    _this._model.collection.updateOne(conditions, changes, { w: "majority" }, function (err, changed) {
                        if (err) {
                            err["conditions"] = conditions;
                            err["changes"] = changes;
                            return reject(err);
                        }
                        return resolve(!!changed.modifiedCount);
                    });
                });
            }
        }).catch(function (err) {
            err["original"] = _this._original;
            err["modified"] = _this._modified;
            return Bluebird.reject(err);
        }).then(function (changed) {
            conditions = { _id: _this._modified._id };
            if (!changed)
                return _this._modified;
            return new Bluebird(function (resolve, reject) {
                _this._model.collection.find(conditions).limit(1).next(function (err, latest) {
                    if (err)
                        return reject(err);
                    return resolve(latest);
                });
            });
        }).then(function (latest) {
            if (!latest) {
                _this._isNew = true;
                _this._original = _this._model.helpers.cloneDocument(_this._modified);
                return Bluebird.resolve(_this);
            }
            return _this._model.handlers.documentReceived(conditions, latest, function (value) {
                _this._isPartial = false;
                _this._isNew = false;
                _this._modified = value;
                _this._original = _this._model.helpers.cloneDocument(value);
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
        var conditions = { _id: this._original._id };
        return Bluebird.resolve().then(function () {
            return new Bluebird(function (resolve, reject) {
                _this._model.collection.find(conditions).limit(1).next(function (err, doc) {
                    if (err)
                        return reject(err);
                    return resolve(doc);
                });
            });
        }).then(function (newDocument) {
            if (!newDocument) {
                _this._isPartial = true;
                _this._isNew = true;
                _this._original = _this._model.helpers.cloneDocument(_this._modified);
                return _this;
            }
            return _this._model.handlers.documentReceived(conditions, newDocument, function (doc) {
                _this._isNew = false;
                _this._isPartial = false;
                _this._original = doc;
                _this._modified = _this._model.helpers.cloneDocument(doc);
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
        var conditions = { _id: this._original._id };
        return Bluebird.resolve().then(function () {
            if (_this._isNew)
                return 0;
            return new Bluebird(function (resolve, reject) {
                _this._model.collection.deleteOne(conditions, { w: "majority" }, function (err, removed) {
                    if (err)
                        return reject(err);
                    return resolve(removed);
                });
            });
        }).then(function (removed) {
            if (removed)
                return _this._model.cache.clear(conditions);
            return false;
        }).then(function () {
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
    /**
     * The schema used to validate documents of this type before being stored in the database.
     */
    Instance.schema = {
        _id: false
    };
    /**
     * Additional which should be made available for use in the schema definition for this instance.
     */
    Instance.validators = Validators_1.DefaultValidators();
    /**
     * The transformations which should be applied to properties of documents of this type.
     */
    Instance.transforms = {};
    /**
     * The indexes which should be managed by Iridium for the collection used by this type.
     */
    Instance.indexes = [];
    return Instance;
}());
exports.Instance = Instance;

//# sourceMappingURL=Instance.js.map
