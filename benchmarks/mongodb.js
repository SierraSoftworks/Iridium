var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../_references.d.ts" />
var Iridium = require('../index');
var Bluebird = require('bluebird');
var _ = require('lodash');
var crypto = require('crypto');
var intensity = 1000;
var samples = 3;
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
            _id: false
        });
        this.UserWrapped = new Iridium.Model(this, WrappedUser, 'iridiumWrapped', {
            _id: false
        });
    }
    return IridiumDB;
})(Iridium.Core);
console.log("Running benchmark with intensity of %d, %d samples", intensity, samples);
var results = {};
function benchmark(name, prepare, run, compareTo) {
    return Bluebird.resolve(new Array(samples)).map(function () {
        var objects = new Array(intensity);
        for (var i = 0; i < objects.length; i++)
            objects[i] = { _id: crypto.pseudoRandomBytes(16).toString('hex') };
        return Bluebird.resolve().then(function () { return prepare(objects); }).then(function () {
            var start = new Date();
            return Bluebird.resolve().then(function () { return run(objects); }).then(function () {
                var time = new Date().valueOf() - start.valueOf();
                return time;
            });
        });
    }, { concurency: 1 }).then(function (times) {
        results[name] = _.reduce(times, function (x, y) { return x + y; }, 0) / times.length;
        console.log("%s: %dms", name, results[name]);
        if (compareTo) {
            if (Math.abs(results[name] - results[compareTo]) / results[compareTo] < 0.1)
                ;
            else if (results[name] > results[compareTo])
                console.log(" - %dx slower than %s", (results[name] / results[compareTo]).toPrecision(2), compareTo);
            else if (results[name] < results[compareTo])
                console.log(" - %dx faster than %s", (results[name] / results[compareTo]).toPrecision(2), compareTo);
        }
        return results[name];
    });
}
var iDB = new IridiumDB();
iDB.connect().then(function () { return iDB.User.remove(); }).then(function () { return iDB.UserWrapped.remove(); }).then(function () {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').remove(function (err) {
            if (err)
                return reject(err);
            return resolve(null);
        });
    });
}).then(function () { return benchmark("MongoDB insert()", function () {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').remove({}, function (err) {
            if (err)
                return reject(err);
            return resolve(null);
        });
    });
}, function (objects) {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').insert(objects, function (err, objects) {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
}); }).then(function () { return benchmark("Iridium insert()", function () { return iDB.User.remove(); }, function (objects) { return iDB.User.insert(objects); }, "MongoDB insert()"); }).then(function () { return benchmark("Iridium Instances insert()", function () { return iDB.UserWrapped.remove(); }, function (objects) { return iDB.UserWrapped.insert(objects); }, "MongoDB insert()"); }).then(function () { return benchmark("MongoDB find()", function () { return null; }, function () {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').find().toArray(function (err, objects) {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
}); }).then(function () { return benchmark("Iridium find()", function () { return null; }, function () { return iDB.User.find().toArray(); }, "MongoDB find()"); }).then(function () { return benchmark("Iridium Instances find()", function () { return null; }, function () { return iDB.UserWrapped.find().toArray(); }, "MongoDB find()"); }).then(function () {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').remove(function (err, objects) {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
}).then(function () { return benchmark("MongoDB remove()", function (objects) {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').insert(objects, function (err, objects) {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
}, function () {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').remove(function (err, objects) {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
}); }).then(function () { return iDB.User.remove(); }).then(function () { return benchmark("Iridium remove()", function (objects) { return iDB.User.insert(objects); }, function () { return iDB.User.remove(); }, "MongoDB remove()"); }).then(function () { return iDB.UserWrapped.remove(); }).catch(function (err) { return console.error(err); }).finally(function () { return iDB.close(); });
//# sourceMappingURL=mongodb.js.map