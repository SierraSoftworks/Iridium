/// <reference path="../_references.d.ts" />
import Iridium = require('../index');
import Bluebird = require('bluebird');
import MongoDB = require('mongodb');
import _ = require('lodash');

var intensity = 1000;
var samples = 5;

var objects = [];
for (var i = 0; i < intensity; i++)
    objects.push({ name: 'John', surname: 'Doe', birthday: new Date() });

class User {
    _id: string;
    name: string;
    surname: string;
    birthday: Date;
}

class WrappedUser extends Iridium.Instance<User, WrappedUser> {
    _id: string;
    name: string;
    surname: string;
    birthday: Date;
}

class IridiumDB extends Iridium.Core {
    constructor() {
        super({ database: 'test' });
    }

    User = new Iridium.Model<User, User>(this,(model, doc) => doc, 'iridium', {
        _id: false,
        name: String,
        surname: String,
        birthday: Date
    });

    UserWrapped = new Iridium.Model<User, WrappedUser>(this, WrappedUser, 'iridiumWrapped', {
        _id: false,
        name: String,
        surname: String,
        birthday: Date
    });
}

var benchmarks: { [target: string]: { [action: string]: number[] } } = {

};

function benchmark<T>(implementation: string, actionName: string, prepare: () => Bluebird<any>, action: () => Bluebird<T>): Bluebird<number> {
    var times = [];
    var promise: Bluebird<any> = Bluebird.resolve();

    for (var i = 0; i < samples; i++)
        promise = promise.then(prepare).then(() => {
            var start = new Date();

            return action().then((result) => {
                var ms = (new Date()).getTime() - start.getTime();

                benchmarks[implementation] = benchmarks[implementation] || {};
                benchmarks[implementation][actionName] = benchmarks[implementation][actionName] || [];

                benchmarks[implementation][actionName].push(ms);
                times.push(ms);
                return ms;
            });
        });

    return promise.then(() => {
        return _.reduce(times,(x, y) => x + y, 0) / samples;
    });
}

function printResults(implementation: string, action: string, compareTarget?: string) {
    if (!benchmarks[implementation][action]) return null;
    var avg = _.reduce(benchmarks[implementation][action],(x, y) => x + y, 0) / benchmarks[implementation][action].length;
    var max = _.reduce<number, number>(benchmarks[implementation][action],(x, y) => x > y ? x : y);
    var min = _.reduce<number, number>(benchmarks[implementation][action],(x, y) => x < y ? x : y);

    console.log("%s %s", implementation, action);
    console.log("  Average: %dms", avg.toPrecision(2));
    console.log("  Minimum: %dms", min.toPrecision(2));
    console.log("  Maximum: %dms", max.toPrecision(2));

    if (compareTarget) {
        var compareAvg = _.reduce(benchmarks[compareTarget][action],(x, y) => x + y, 0) / benchmarks[implementation][action].length;
        var speedUp = '';
        if ((Math.abs(avg - compareAvg) / compareAvg) < 0.2) speedUp = 'About the same';
        else if (avg > compareAvg) speedUp = (avg / compareAvg).toPrecision(2) + 'x slower';
        else speedUp = (compareAvg / avg).toPrecision(2) + 'x faster';
        console.log("  %s", speedUp);
    }
}

console.log("Running benchmark with intensity of %d, %d samples", intensity, samples);

var iDB = new IridiumDB();
iDB.connect()
    .then(() => iDB.User.remove())
    .then(() => iDB.UserWrapped.remove())
    .then(() => {
    return new Bluebird<any>((resolve, reject) => {
        iDB.connection.collection('mongodb').remove((err) => {
            if (err) return reject(err);
            return resolve(null);
        });
    });
})
    .then(() => benchmark("MongoDB", "insert()",() => {
    return new Bluebird((resolve, reject) => {
        iDB.connection.collection('mongodb').remove({},(err) => {
            if (err) return reject(err);
            return resolve(null);
        });
    });
},() => {
        return new Bluebird<any>((resolve, reject) => {
            iDB.connection.collection('mongodb').insert(objects,(err, objects) => {
                if (err) return reject(err);
                return resolve(objects);
            });
        });
    }))
    .then(() => printResults("MongoDB", "insert()"))
    .then(() => benchmark("Iridium", "insert()",() => iDB.User.remove(),() => iDB.User.insert(objects))).then(() => printResults("Iridium", "insert()", "MongoDB"))
    .then(() => benchmark("Iridium Instances", "insert()",() => iDB.UserWrapped.remove(),() => iDB.UserWrapped.insert(objects))).then(() => printResults("Iridium Instances", "insert()", "MongoDB"))
    
    .then(() => benchmark("MongoDB", "find()",() => null,() => {
        return new Bluebird<any>((resolve, reject) => {
            iDB.connection.collection('mongodb').find().toArray((err, objects: any) => {
                if (err) return reject(err);
                return resolve(objects);
            });
        });
    })).then(() => printResults("MongoDB", "find()"))
    .then(() => benchmark("Iridium", "find()",() => null,() => iDB.User.find().toArray())).then(() => printResults("Iridium", "find()", "MongoDB"))
    .then(() => benchmark("Iridium Instances", "find()",() => null,() => iDB.UserWrapped.find().toArray())).then(() => printResults("Iridium Instances", "find()", "MongoDB"))

    .then(() => {
        return new Bluebird<any>((resolve, reject) => {
            iDB.connection.collection('mongodb').remove((err, objects: any) => {
                if (err) return reject(err);
                return resolve(objects);
            });
        });
    })
    .then(() => benchmark("MongoDB", "remove()",() => {
        return new Bluebird<any>((resolve, reject) => {
            iDB.connection.collection('mongodb').insert(objects,(err, objects) => {
                if (err) return reject(err);
                return resolve(objects);
            });
        });
    },() => {
        return new Bluebird<any>((resolve, reject) => {
            iDB.connection.collection('mongodb').remove((err, objects: any) => {
                if (err) return reject(err);
                return resolve(objects);
            });
        });
        })).then(() => printResults("MongoDB", "remove()"))
    .then(() => iDB.User.remove())
    .then(() => benchmark("Iridium", "remove()",() => iDB.User.insert(objects),() => iDB.User.remove())).then(() => printResults("Iridium", "remove()", "MongoDB"))
    .then(() => iDB.UserWrapped.remove())

    .catch((err) => console.error(err))
    .finally(() => iDB.close());