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
var intensity = 1000;
var samples = 5;
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
var benchmarks = {};
function benchmark(implementation, actionName, prepare, action) {
    var times = [];
    var promise = Bluebird.resolve();
    for (var i = 0; i < samples; i++)
        promise = promise.then(prepare).then(function () {
            var start = new Date();
            return action().then(function (result) {
                var ms = (new Date()).getTime() - start.getTime();
                benchmarks[implementation] = benchmarks[implementation] || {};
                benchmarks[implementation][actionName] = benchmarks[implementation][actionName] || [];
                benchmarks[implementation][actionName].push(ms);
                times.push(ms);
                return ms;
            });
        });
    return promise.then(function () {
        return _.reduce(times, function (x, y) { return x + y; }, 0) / samples;
    });
}
function printResults(implementation, action, compareTarget) {
    if (!benchmarks[implementation][action])
        return null;
    var avg = _.reduce(benchmarks[implementation][action], function (x, y) { return x + y; }, 0) / benchmarks[implementation][action].length;
    var max = _.reduce(benchmarks[implementation][action], function (x, y) { return x > y ? x : y; });
    var min = _.reduce(benchmarks[implementation][action], function (x, y) { return x < y ? x : y; });
    console.log("%s %s", implementation, action);
    console.log("  Average: %dms", avg.toPrecision(2));
    console.log("  Minimum: %dms", min.toPrecision(2));
    console.log("  Maximum: %dms", max.toPrecision(2));
    if (compareTarget) {
        var compareAvg = _.reduce(benchmarks[compareTarget][action], function (x, y) { return x + y; }, 0) / benchmarks[implementation][action].length;
        var speedUp = '';
        if ((Math.abs(avg - compareAvg) / compareAvg) < 0.2)
            speedUp = 'About the same';
        else if (avg > compareAvg)
            speedUp = (avg / compareAvg).toPrecision(2) + 'x slower';
        else
            speedUp = (compareAvg / avg).toPrecision(2) + 'x faster';
        console.log("  %s", speedUp);
    }
}
console.log("Running benchmark with intensity of %d, %d samples", intensity, samples);
var iDB = new IridiumDB();
iDB.connect().then(function () { return iDB.User.remove(); }).then(function () { return iDB.UserWrapped.remove(); }).then(function () {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').remove(function (err) {
            if (err)
                return reject(err);
            return resolve(null);
        });
    });
}).then(function () { return benchmark("MongoDB", "insert()", function () {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').remove({}, function (err) {
            if (err)
                return reject(err);
            return resolve(null);
        });
    });
}, function () {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').insert(objects, function (err, objects) {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
}); }).then(function () { return printResults("MongoDB", "insert()"); }).then(function () { return benchmark("Iridium", "insert()", function () { return iDB.User.remove(); }, function () { return iDB.User.insert(objects); }); }).then(function () { return printResults("Iridium", "insert()", "MongoDB"); }).then(function () { return benchmark("Iridium Instances", "insert()", function () { return iDB.UserWrapped.remove(); }, function () { return iDB.UserWrapped.insert(objects); }); }).then(function () { return printResults("Iridium Instances", "insert()", "MongoDB"); }).then(function () { return benchmark("MongoDB", "find()", function () { return null; }, function () {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').find().toArray(function (err, objects) {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
}); }).then(function () { return printResults("MongoDB", "find()"); }).then(function () { return benchmark("Iridium", "find()", function () { return null; }, function () { return iDB.User.find().toArray(); }); }).then(function () { return printResults("Iridium", "find()", "MongoDB"); }).then(function () { return benchmark("Iridium Instances", "find()", function () { return null; }, function () { return iDB.UserWrapped.find().toArray(); }); }).then(function () { return printResults("Iridium Instances", "find()", "MongoDB"); }).then(function () {
    return new Bluebird(function (resolve, reject) {
        iDB.connection.collection('mongodb').remove(function (err, objects) {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
}).then(function () { return benchmark("MongoDB", "remove()", function () {
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
}); }).then(function () { return printResults("MongoDB", "remove()"); }).then(function () { return iDB.User.remove(); }).then(function () { return benchmark("Iridium", "remove()", function () { return iDB.User.insert(objects); }, function () { return iDB.User.remove(); }); }).then(function () { return printResults("Iridium", "remove()", "MongoDB"); }).then(function () { return iDB.UserWrapped.remove(); }).catch(function (err) { return console.error(err); }).finally(function () { return iDB.close(); });
//# sourceMappingURL=mongodb.js.map