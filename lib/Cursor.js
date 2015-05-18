var Bluebird = require('bluebird');
var Cursor = (function () {
    function Cursor(model, conditions, cursor) {
        this.model = model;
        this.conditions = conditions;
        this.cursor = cursor;
    }
    Cursor.prototype.count = function (callback) {
        var _this = this;
        return new Bluebird(function (resolve, reject) {
            _this.cursor.count(true, function (err, count) {
                if (err)
                    return reject(err);
                return resolve(count);
            });
        }).nodeify(callback);
    };
    Cursor.prototype.forEach = function (handler, callback) {
        var _this = this;
        var helpers = this.model.helpers;
        return new Bluebird(function (resolve, reject) {
            _this.cursor.forEach(function (item) {
                _this.model.handlers.documentReceived(_this.conditions, item, function () { return helpers.wrapDocument.apply(helpers, arguments); }).then(handler);
            }, function (err) {
                if (err)
                    return reject(err);
                return resolve(null);
            });
        }).nodeify(callback);
    };
    Cursor.prototype.map = function (transform, callback) {
        var _this = this;
        var helpers = this.model.helpers;
        return new Bluebird(function (resolve, reject) {
            var promises = [];
            _this.cursor.forEach(function (item) {
                promises.push(_this.model.handlers.documentReceived(_this.conditions, item, function () { return helpers.wrapDocument.apply(helpers, arguments); })
                    .then(transform));
            }, function (err) {
                if (err)
                    return reject(err);
                return resolve(Bluebird.all(promises));
            });
        }).nodeify(callback);
    };
    Cursor.prototype.toArray = function (callback) {
        var _this = this;
        var helpers = this.model.helpers;
        return new Bluebird(function (resolve, reject) {
            _this.cursor.toArray(function (err, results) {
                if (err)
                    return reject(err);
                return resolve(results);
            });
        }).map(function (document) {
            return _this.model.handlers.documentReceived(_this.conditions, document, function () { return helpers.wrapDocument.apply(helpers, arguments); });
        }).nodeify(callback);
    };
    Cursor.prototype.next = function (callback) {
        var _this = this;
        return new Bluebird(function (resolve, reject) {
            _this.cursor.next(function (err, result) {
                if (err)
                    return reject(err);
                return resolve(result);
            });
        }).then(function (document) {
            return _this.model.handlers.documentReceived(_this.conditions, document, function (document, isNew, isPartial) { return _this.model.helpers.wrapDocument(document, isNew, isPartial); });
        }).nodeify(callback);
    };
    Cursor.prototype.rewind = function () {
        this.cursor.rewind();
        return this;
    };
    Cursor.prototype.sort = function (sortExpression) {
        return new Cursor(this.model, this.conditions, this.cursor.sort(sortExpression));
    };
    Cursor.prototype.limit = function (limit) {
        return new Cursor(this.model, this.conditions, this.cursor.limit(limit));
    };
    Cursor.prototype.skip = function (skip) {
        return new Cursor(this.model, this.conditions, this.cursor.skip(skip));
    };
    return Cursor;
})();
module.exports = Cursor;
//# sourceMappingURL=Cursor.js.map