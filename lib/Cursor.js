var Promise = require('bluebird');
var Cursor = (function () {
    function Cursor(model, conditions, cursor) {
        this.model = model;
        this.conditions = conditions;
        this.cursor = cursor;
    }
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
    Cursor.prototype.each = function (handler, callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var promises = [];
            _this.cursor.each(function (err, item) {
                if (err)
                    return reject(err);
                if (!item)
                    return resolve(Promise.all(promises).then(function () { return null; }));
                promises.push(_this.model.handlers.documentReceived(_this.conditions, item, function (document, isNew, isPartial) { return _this.model.helpers.wrapDocument(document, isNew, isPartial); }).then(handler));
            });
        }).nodeify(callback);
    };
    Cursor.prototype.map = function (handler, callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var promises = [];
            _this.cursor.each(function (err, item) {
                if (err)
                    return reject(err);
                if (!item)
                    return resolve(Promise.all(promises));
                promises.push(_this.model.handlers.documentReceived(_this.conditions, item, function (document, isNew, isPartial) { return _this.model.helpers.wrapDocument(document, isNew, isPartial); }).then(handler));
            });
        }).nodeify(callback);
    };
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
    Cursor.prototype.rewind = function () {
        return new Cursor(this.model, this.conditions, this.cursor.rewind());
    };
    Cursor.prototype.sort = function (sortExpression) {
        return new Cursor(this.model, this.conditions, this.cursor.sort(sortExpression));
    };
    Cursor.prototype.limit = function (number) {
        return new Cursor(this.model, this.conditions, this.cursor.limit(number));
    };
    Cursor.prototype.skip = function (number) {
        return new Cursor(this.model, this.conditions, this.cursor.skip(number));
    };
    return Cursor;
})();
module.exports = Cursor;
//# sourceMappingURL=Cursor.js.map