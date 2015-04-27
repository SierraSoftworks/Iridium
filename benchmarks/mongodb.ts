/// <reference path="../_references.d.ts" />
import Iridium = require('../index');
import Bluebird = require('bluebird');
import MongoDB = require('mongodb');
import _ = require('lodash');
import crypto = require('crypto');

var intensity = 20000;
var samples = 1;

interface UserDocument {
    _id: string;
}

class User {
    _id: string;
}

class WrappedUser extends Iridium.Instance<UserDocument, WrappedUser> {
    _id: string;
}

class IridiumDB extends Iridium.Core {
    constructor() {
        super({ database: 'test' });
    }

    User = new Iridium.Model<UserDocument, User>(this,(model, doc) => doc, 'iridium', {
        _id: false
    });

    UserWrapped = new Iridium.Model<UserDocument, WrappedUser>(this, WrappedUser, 'iridiumWrapped', {
        _id: false
    });
}

console.log("Running benchmark with intensity of %d, %d samples", intensity, samples);

var results: { [name: string]: number } = {};
function benchmark(name: string, prepare: (objects: UserDocument[]) => Bluebird<any>, run: (objects: UserDocument[]) => Bluebird<any>, compareTo?: string) {
    return Bluebird.resolve(new Array(samples)).map(() => {
        var objects: UserDocument[] = new Array(intensity);
        for (var i = 0; i < objects.length; i++)
            objects[i] = { _id: crypto.pseudoRandomBytes(16).toString('hex') };

        return Promise.resolve().then(() => prepare(objects)).then(() => {
            var start = new Date();
            return Promise.resolve().then(() => run(objects)).then(() => {
                var time = new Date().valueOf() - start.valueOf();
                return time;
            });
        })
    }, { concurency: 1 }).then(times => {
        results[name] = _.reduce(<number[]><any>times,(x, y) => x + y, 0) / times.length;
        console.log("%s: %dms", name, results[name]);
        if (compareTo) {
            if (Math.abs(results[name] - results[compareTo]) / results[compareTo] < 0.1);
            else if (results[name] > results[compareTo]) console.log(" - %dx slower than %s",(results[name] / results[compareTo]).toPrecision(2), compareTo);
            else if (results[name] < results[compareTo]) console.log(" - %dx faster than %s",(results[name] / results[compareTo]).toPrecision(2), compareTo);
        }

        return results[name];
    });
}

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
    .then(() => benchmark("MongoDB insert()",() => {
    return new Bluebird((resolve, reject) => {
        iDB.connection.collection('mongodb').remove({},(err) => {
            if (err) return reject(err);
            return resolve(null);
        });
    });
},(objects) => {
        return new Bluebird<any>((resolve, reject) => {
            iDB.connection.collection('mongodb').insert(objects,(err, objects) => {
                if (err) return reject(err);
                return resolve(objects);
            });
        });
    }))
    .then(() => benchmark("Iridium insert()",() => iDB.User.remove(),(objects) => iDB.User.insert(objects), "MongoDB insert()"))
    .then(() => benchmark("Iridium Instances insert()",() => iDB.UserWrapped.remove(),(objects) => iDB.UserWrapped.insert(objects), "MongoDB insert()"))

    .then(() => benchmark("MongoDB find()",() => null,() => {
    return new Bluebird<any>((resolve, reject) => {
        iDB.connection.collection('mongodb').find().toArray((err, objects: any) => {
            if (err) return reject(err);
            return resolve(objects);
        });
    });
}))
    .then(() => benchmark("Iridium find()",() => null,() => iDB.User.find().toArray(), "MongoDB find()"))
    .then(() => benchmark("Iridium Instances find()",() => null,() => iDB.UserWrapped.find().toArray(), "MongoDB find()"))

    .then(() => {
    return new Bluebird<any>((resolve, reject) => {
        iDB.connection.collection('mongodb').remove((err, objects: any) => {
            if (err) return reject(err);
            return resolve(objects);
        });
    });
})
    .then(() => benchmark("MongoDB remove()",(objects) => {
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
    }))
    .then(() => iDB.User.remove())
    .then(() => benchmark("Iridium remove()",(objects) => iDB.User.insert(objects),() => iDB.User.remove(), "MongoDB remove()"))
    .then(() => iDB.UserWrapped.remove())

    .catch((err) => console.error(err))
    .finally(() => iDB.close());