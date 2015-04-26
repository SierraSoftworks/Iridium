/// <reference path="../_references.d.ts" />
import Iridium = require('../index');
import Bluebird = require('bluebird');
import MongoDB = require('mongodb');

var intensity = 10000;

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

var baseline = null;
function benchmark<T>(format, action: () => Bluebird<T>, compareTo?: number): Bluebird<number> {
    var start = new Date();
    return action().then((result) => {
        var ms = (new Date()).getTime() - start.getTime();
        if(compareTo) {
            var speedUp = '';
            if((Math.abs(ms - compareTo) / compareTo) < 0.2) speedUp = '(about the same)';
            else if(ms > compareTo) speedUp = '(' + (ms / compareTo).toPrecision(2) + 'x slower)';
            else speedUp = '(' + (compareTo / ms).toPrecision(2) + 'x faster)';
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
    .then(() => benchmark("MongoDB inserting: %s", () => {
        return new Bluebird<any>((resolve, reject) => {
            iDB.connection.collection('mongodb').insert(objects, (err, objects) => {
                if(err) return reject(err);
                return resolve(objects);
            });
        });
    }))
    .then(() => benchmark("Iridium Instances inserting: %s", () => iDB.UserWrapped.insert(objects), baseline))
    .then(() => benchmark("Iridium inserting: %s", () => iDB.User.insert(objects), baseline))

    .then(() => benchmark("MongoDB finding: %s", () => {
        return new Bluebird<any>((resolve, reject) => {
            iDB.connection.collection('mongodb').find().toArray((err, objects: any) => {
                if(err) return reject(err);
                return resolve(objects);
            });
        });
    }))
    .then(() => benchmark("Iridium Instances finding (toArray): %s",() => iDB.UserWrapped.find().toArray(), baseline))
    .then(() => benchmark("Iridium finding (toArray): %s",() => iDB.User.find().toArray(), baseline))
    .then(() => benchmark("Iridium Instances finding (map): %s",() => iDB.UserWrapped.find().map(x => x), baseline))
    .then(() => benchmark("Iridium finding (map): %s",() => iDB.User.find().map(x => x), baseline))

    .then(() => benchmark("MongoDB removing: %s", () => {
        return new Bluebird<any>((resolve, reject) => {
            iDB.connection.collection('mongodb').remove((err, objects: any) => {
                if(err) return reject(err);
                return resolve(objects);
            });
        });
    }))
    .then(() => benchmark("Iridium Instances removing: %s", () => iDB.UserWrapped.remove(), baseline))
    .then(() => benchmark("Iridium removing: %s", () => iDB.User.remove(), baseline))

    .then(() => iDB.close())
    .catch((err) => console.error(err));