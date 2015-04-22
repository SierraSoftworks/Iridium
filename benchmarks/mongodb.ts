/// <reference path="../_references.d.ts" />
import Iridium = require('../index');
import Promise = require('bluebird');
import MongoDB = require('mongodb');

var objects = [];
for(var i = 0; i < 10000; i++)
    objects.push({ name: 'John', surname: 'Doe', birthday: new Date() });

class User {
    id: string;
    name: string;
    surname: string;
    birthday: Date;
}

class WrappedUser extends Iridium.Instance<User, WrappedUser> {
    id: string;
    name: string;
    surname: string;
    birthday: Date;
}

class IridiumDB extends Iridium.Core {
    constructor() {
        super({ database: 'test' });
    }

    User = new Iridium.Model<User, User>(this, User, 'iridium', {
        name: String,
        surname: String,
        birthday: Date
    });

    UserWrapped = new Iridium.Model<User, WrappedUser>(this, WrappedUser, 'iridiumWrapped', {
        name: String,
        surname: String,
        birthday: Date
    });
}

var baseline = null;
function benchmark<T>(format, action: () => Promise<T>, compareTo?: number): Promise<number> {
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

var iDB = new IridiumDB();
iDB.connect()
    .then(() => iDB.User.remove())
    .then(() => iDB.UserWrapped.remove())
    .then(() => {
        return new Promise<any>((resolve, reject) => {
            iDB.connection.collection('mongodb').remove((err) => {
                if (err) return reject(err);
                return resolve(null);
            });
        });
    })
    .then(() => benchmark("MongoDB inserting 10 000 documents: %s", () => {
        return new Promise<any>((resolve, reject) => {
            iDB.connection.collection('mongodb').insert(objects, (err, objects) => {
                if(err) return reject(err);
                return resolve(objects);
            });
        });
    }))
    .then(() => benchmark("Iridium Instances inserting 10 000 documents: %s", () => iDB.UserWrapped.insert(objects), baseline))
    .then(() => benchmark("Iridium inserting 10 000 documents: %s", () => iDB.User.insert(objects), baseline))

    .then(() => benchmark("MongoDB finding 10 000 documents: %s", () => {
        return new Promise<any>((resolve, reject) => {
            iDB.connection.collection('mongodb').find().toArray((err, objects: any) => {
                if(err) return reject(err);
                return resolve(objects);
            });
        });
    }))
    .then(() => benchmark("Iridium Instances finding 10 000 documents: %s", () => iDB.UserWrapped.find(), baseline))
    .then(() => benchmark("Iridium finding 10 000 documents: %s", () => iDB.User.find(), baseline))

    .then(() => benchmark("MongoDB removing 10 000 documents: %s", () => {
        return new Promise<any>((resolve, reject) => {
            iDB.connection.collection('mongodb').remove((err, objects: any) => {
                if(err) return reject(err);
                return resolve(objects);
            });
        });
    }))
    .then(() => benchmark("Iridium Instances removing 10 000 documents: %s", () => iDB.UserWrapped.remove(), baseline))
    .then(() => benchmark("Iridium removing 10 000 documents: %s", () => iDB.User.remove(), baseline))

    .then(() => iDB.close())
    .catch((err) => console.error(err));