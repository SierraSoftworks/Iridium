"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Iridium = require("../iridium");
const _ = require("lodash");
const crypto = require("crypto");
var intensity = 1000;
var samples = 3;
class User {
}
User.collection = "user";
User.schema = {
    _id: String
};
let WrappedUser = class WrappedUser extends Iridium.Instance {
};
__decorate([
    Iridium.Property(String, true)
], WrappedUser.prototype, "_id", void 0);
WrappedUser = __decorate([
    Iridium.Collection("userWrapped")
], WrappedUser);
class IridiumDB extends Iridium.Core {
    constructor() {
        super({ database: "test" });
        this.User = new Iridium.Model(this, User);
        this.UserWrapped = new Iridium.Model(this, WrappedUser);
    }
}
console.log("Running benchmark with intensity of %d, %d samples", intensity, samples);
var results = {};
function benchmark(name, prepare, run, compareTo) {
    return Promise.all(new Array(samples).fill(0).map(() => {
        var objects = new Array(intensity);
        for (var i = 0; i < objects.length; i++)
            objects[i] = { _id: crypto.pseudoRandomBytes(16).toString("hex") };
        return Promise.resolve().then(() => prepare(objects)).then(() => {
            var start = new Date();
            return Promise.resolve().then(() => run(objects)).then(() => {
                var time = new Date().valueOf() - start.valueOf();
                return time;
            });
        });
    }, { concurrency: 1 })).then(times => {
        results[name] = _.reduce(times, (x, y) => x + y, 0) / times.length;
        console.log("%s: %dms", name, results[name]);
        if (compareTo) {
            if (Math.abs(results[name] - results[compareTo]) / results[compareTo] < 0.1) { }
            else if (results[name] > results[compareTo])
                console.log(" - %dx slower than %s", (results[name] / results[compareTo]).toPrecision(2), compareTo);
            else if (results[name] < results[compareTo])
                console.log(" - %dx faster than %s", (results[name] / results[compareTo]).toPrecision(2), compareTo);
        }
        return results[name];
    });
}
var iDB = new IridiumDB();
iDB.connect()
    .then(() => iDB.User.remove())
    .then(() => iDB.UserWrapped.remove())
    .then(() => {
    return new Promise((resolve, reject) => {
        iDB.db.collection("mongodb").deleteMany((err) => {
            if (err)
                return reject(err);
            return resolve(null);
        });
    });
})
    .then(() => benchmark("MongoDB insert()", () => {
    return new Promise((resolve, reject) => {
        iDB.db.collection("mongodb").deleteMany({}, (err) => {
            if (err)
                return reject(err);
            return resolve({});
        });
    });
}, (objects) => {
    return new Promise((resolve, reject) => {
        iDB.db.collection("mongodb").insertMany(objects, (err, objects) => {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
}))
    .then(() => benchmark("Iridium insert()", () => iDB.User.remove(), (objects) => iDB.User.insert(objects), "MongoDB insert()"))
    .then(() => benchmark("Iridium Instances insert()", () => iDB.UserWrapped.remove(), (objects) => iDB.UserWrapped.insert(objects), "MongoDB insert()"))
    .then(() => benchmark("MongoDB find()", () => null, () => {
    return new Promise((resolve, reject) => {
        iDB.db.collection("mongodb").find({}).toArray((err, objects) => {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
}))
    .then(() => benchmark("Iridium find()", () => null, () => iDB.User.find().toArray(), "MongoDB find()"))
    .then(() => benchmark("Iridium Instances find()", () => null, () => iDB.UserWrapped.find().toArray(), "MongoDB find()"))
    .then(() => {
    return new Promise((resolve, reject) => {
        iDB.db.collection("mongodb").deleteMany((err, objects) => {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
})
    .then(() => benchmark("MongoDB remove()", (objects) => {
    return new Promise((resolve, reject) => {
        iDB.db.collection("mongodb").deleteMany(objects, (err, objects) => {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
}, () => {
    return new Promise((resolve, reject) => {
        iDB.db.collection("mongodb").deleteMany((err, objects) => {
            if (err)
                return reject(err);
            return resolve(objects);
        });
    });
}))
    .then(() => iDB.User.remove())
    .then(() => benchmark("Iridium remove()", (objects) => iDB.User.insert(objects), () => iDB.User.remove(), "MongoDB remove()"))
    .then(() => iDB.UserWrapped.remove())
    .catch((err) => console.error(err))
    .then(() => iDB.close());
//# sourceMappingURL=mongodb.js.map