var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../_references.d.ts" />
var Iridium = require('../index');
var Bluebird = require('bluebird');
var intensity = 10000;
var objects = [];
for (var i = 0; i < intensity; i++)
    objects.push({ name: 'John', surname: 'Doe', birthday: new Date() });
var User = (function () {
    function User() {
    }
    return User;
})();
var WrappedUser = (function (_super) {
    __extends(WrappedUser, _super);
    function WrappedUser() {
        _super.apply(this, arguments);
    }
    return WrappedUser;
})(Iridium.Instance);
var IridiumDB = (function (_super) {
    __extends(IridiumDB, _super);
    function IridiumDB() {
        _super.call(this, { database: 'test' });
        this.User = new Iridium.Model(this, function (model, doc) { return doc; }, 'iridium', {
            _id: false,
            name: String,
            surname: String,
            birthday: Date
        });
        this.UserWrapped = new Iridium.Model(this, WrappedUser, 'iridiumWrapped', {
            _id: false,
            name: String,
            surname: String,
            birthday: Date
        });
    }
    return IridiumDB;
})(Iridium.Core);
var baseline = null;
function benchmark(format, action, compareTo) {
    var start = new Date();
    return action().then(function (result) {
        var ms = (new Date()).getTime() - start.getTime();
        if (compareTo) {
            var speedUp = '';
            if ((Math.abs(ms - compareTo) / compareTo) < 0.2)
                speedUp = '(about the same)';
            else if (ms > compareTo)
                speedUp = '(' + (ms / compareTo).toPrecision(2) + 'x slower)';
            else
                speedUp = '(' + (compareTo / ms).toPrecision(2) + 'x faster)';
            console.log(format, ms.toString() + 'ms ' + speedUp);
        }
        else {
            console.log(format, ms.toString() + 'ms');
            baseline = ms;
        }
        return ms;
    });
}
console.log("Running benchmark with intensity of %d", intensity);
var iDB = new IridiumDB();
iDB.connect().then(function () { return iDB.User.remove(); }).then(function () { return iDB.UserWrapped.remove(); }).then(function () {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').remove(function (err) {
            if (err)
                return reject(err);
            return resolve(null);
        });
    });
}).then(function () { return benchmark("MongoDB inserting: %s", function () {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').insert(objects, function (err, objects) {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
}); }).then(function () { return benchmark("Iridium Instances inserting: %s", function () { return iDB.UserWrapped.insert(objects); }, baseline); }).then(function () { return benchmark("Iridium inserting: %s", function () { return iDB.User.insert(objects); }, baseline); }).then(function () { return benchmark("MongoDB finding: %s", function () {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').find().toArray(function (err, objects) {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
}); }).then(function () { return benchmark("Iridium Instances finding (toArray): %s", function () { return iDB.UserWrapped.find().toArray(); }, baseline); }).then(function () { return benchmark("Iridium finding (toArray): %s", function () { return iDB.User.find().toArray(); }, baseline); }).then(function () { return benchmark("Iridium Instances finding (map): %s", function () { return iDB.UserWrapped.find().map(function (x) { return x; }); }, baseline); }).then(function () { return benchmark("Iridium finding (map): %s", function () { return iDB.User.find().map(function (x) { return x; }); }, baseline); }).then(function () { return benchmark("MongoDB removing: %s", function () {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').remove(function (err, objects) {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
}); }).then(function () { return benchmark("Iridium Instances removing: %s", function () { return iDB.UserWrapped.remove(); }, baseline); }).then(function () { return benchmark("Iridium removing: %s", function () { return iDB.User.remove(); }, baseline); }).then(function () { return iDB.close(); }).catch(function (err) { return console.error(err); });
//# sourceMappingURL=mongodb.js.map