var Promise = require('bluebird');
var Cursor = (function () {
    function Cursor(model, conditions, cursor) {
        this.model = model;
        this.conditions = conditions;
        this.cursor = cursor;
    }
    /**
     * Counts the number of documents which are matched by this cursor
     * @param {function(Error, Number)} callback A callback which is triggered when the result is available
     * @return {Promise<number>} A promise which will resolve with the number of documents matched by this cursor
     */
    Cursor.prototype.count = function (callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.cursor.count(true, function (err, count) {
                if (err)
                    return reject(err);
                return resolve(count);
            });
        }).nodeify(callback);
    };
    /**
     * Runs the specified handler over each instance in the query results
     * @param {function(Instance)} handler The handler which is triggered for each element in the query
     * @param {function(Error)} callback A callback which is triggered when all operations have been dispatched
     * @return {Promise} A promise which is resolved when all operations have been dispatched
     */
    Cursor.prototype.each = function (handler, callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.cursor.each(function (err, item) {
                if (err)
                    return reject(err);
                if (!item)
                    return resolve(null);
                _this.model.handlers.documentReceived(_this.conditions, item, function (document, isNew, isPartial) { return _this.model.helpers.wrapDocument(document, isNew, isPartial); }).then(handler);
            });
        }).nodeify(callback);
    };
    /**
     * Runs the specified transform over each instance in the query results and returns the resulting transformed objects
     * @param {function(Instance): TResult} transform A handler which is used to transform the result objects
     * @param {function(Error, TResult[])} callback A callback which is triggered when the transformations are completed
     * @return {Promise<TResult[]>} A promise which is fulfilled with the results of the transformations
     */
    Cursor.prototype.map = function (transform, callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var promises = [];
            _this.cursor.each(function (err, item) {
                if (err)
                    return reject(err);
                if (!item)
                    return resolve(Promise.all(promises));
                promises.push(_this.model.handlers.documentReceived(_this.conditions, item, function (document, isNew, isPartial) { return _this.model.helpers.wrapDocument(document, isNew, isPartial); }).then(transform));
            });
        }).nodeify(callback);
    };
    /**
     * Retrieves all matching instances and returns them in an array
     * @param {function(Error, TInstance[])} callback A callback which is triggered with the resulting instances
     * @return {Promise<TInstance[]>} A promise which resolves with the instances returned by the query
     */
    Cursor.prototype.toArray = function (callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.cursor.toArray(function (err, results) {
                if (err)
                    return reject(err);
                return resolve(results);
            });
        }).map(function (document) {
            return _this.model.handlers.documentReceived(_this.conditions, document, function (document, isNew, isPartial) { return _this.model.helpers.wrapDocument(document, isNew, isPartial); });
        }).nodeify(callback);
    };
    /**
     * Retrieves the next item in the results list
     * @param {function(Error, TInstance)} callback A callback which is triggered when the next item becomes available
     * @return {Promise<TInstance>} A promise which is resolved with the next item
     */
    Cursor.prototype.next = function (callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.cursor.nextObject(function (err, result) {
                if (err)
                    return reject(err);
                return resolve(result);
            });
        }).then(function (document) {
            return _this.model.handlers.documentReceived(_this.conditions, document, function (document, isNew, isPartial) { return _this.model.helpers.wrapDocument(document, isNew, isPartial); });
        }).nodeify(callback);
    };
    /**
     * Returns a new cursor which behaves the same as this one did before any results were retrieved
     * @return {Cursor} The new cursor which starts at the beginning of the results
     */
    Cursor.prototype.rewind = function () {
        return new Cursor(this.model, this.conditions, this.cursor.rewind());
    };
    /**
     * Returns a new cursor which sorts its results by the given index expression
     * @param {model.IndexSpecification} sortExpression The index expression dictating the sort order and direction to use
     * @return {Cursor} The new cursor which sorts its results by the sortExpression
     */
    Cursor.prototype.sort = function (sortExpression) {
        return new Cursor(this.model, this.conditions, this.cursor.sort(sortExpression));
    };
    /**
     * Returns a new cursor which limits the number of returned results
     * @param {Number} limit The maximum number of results to return
     * @return {Cursor} The new cursor which will return a maximum number of results
     */
    Cursor.prototype.limit = function (limit) {
        return new Cursor(this.model, this.conditions, this.cursor.limit(limit));
    };
    /**
     * Returns a new cursor which skips a number of results before it begins
     * returning any.
     * @param {Number} skip The number of results to skip before the cursor beings returning
     * @return {Cursor} The new cursor which skips a number of results
     */
    Cursor.prototype.skip = function (skip) {
        return new Cursor(this.model, this.conditions, this.cursor.skip(skip));
    };
    return Cursor;
})();
module.exports = Cursor;
//# sourceMappingURL=Cursor.js.map