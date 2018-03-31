import * as Iridium from "../iridium";
import * as MongoDB from "mongodb";
import * as _ from "lodash";
import * as crypto from "crypto";

var intensity = 1000;
var samples = 3;

interface UserDocument {
    _id: string;
}

class User {
    _id: string;

    static collection = "user";
    static schema = {
        _id: String
    };
}

@Iridium.Collection("userWrapped")
class WrappedUser extends Iridium.Instance<UserDocument, WrappedUser> {
    @Iridium.Property(String, true)
    _id: string;
}

class IridiumDB extends Iridium.Core {
    constructor() {
        super({ database: "test" });
    }

    User = new Iridium.Model<UserDocument, User>(this, User);
    UserWrapped = new Iridium.Model<UserDocument, WrappedUser>(this, WrappedUser);
}

console.log("Running benchmark with intensity of %d, %d samples", intensity, samples);

var results: { [name: string]: number } = {};
function benchmark(name: string, prepare: (objects: UserDocument[]) => Promise<any>|null, run: (objects: UserDocument[]) => Promise<any>, compareTo?: string) {
    return Promise.all(new Array(samples).fill(0).map(() => {
        var objects: UserDocument[] = new Array(intensity);
        for (var i = 0; i < objects.length; i++)
            objects[i] = { _id: crypto.pseudoRandomBytes(16).toString("hex") };

        return Promise.resolve().then(() => prepare(objects)).then(() => {
            var start = new Date();
            return Promise.resolve().then(() => run(objects)).then(() => {
                var time = new Date().valueOf() - start.valueOf();
                return time;
            });
        })
    }, { concurrency: 1 })).then(times => {
        results[name] = _.reduce(<number[]><any>times,(x, y) => x + y, 0) / times.length;
        console.log("%s: %dms", name, results[name]);
        if (compareTo) {
            if (Math.abs(results[name] - results[compareTo]) / results[compareTo] < 0.1) { }
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
    return new Promise<any>((resolve, reject) => {
        iDB.db.collection("mongodb").deleteMany((err: Error) => {
            if (err) return reject(err);
            return resolve(null);
        });
    });
})
    .then(() => benchmark("MongoDB insert()",() => {
    return new Promise((resolve, reject) => {
        iDB.db.collection("mongodb").deleteMany({},(err) => {
            if (err) return reject(err);
            return resolve({});
        });
    });
},(objects) => {
        return new Promise<any>((resolve, reject) => {
            iDB.db.collection("mongodb").insertMany(objects,(err, objects) => {
                if (err) return reject(err);
                return resolve(objects);
            });
        });
    }))
    .then(() => benchmark("Iridium insert()",() => iDB.User.remove(),(objects) => iDB.User.insert(objects), "MongoDB insert()"))
    .then(() => benchmark("Iridium Instances insert()",() => iDB.UserWrapped.remove(),(objects) => iDB.UserWrapped.insert(objects), "MongoDB insert()"))

    .then(() => benchmark("MongoDB find()",() => null,() => {
    return new Promise<any>((resolve, reject) => {
        iDB.db.collection("mongodb").find({}).toArray((err: Error, objects: any) => {
            if (err) return reject(err);
            return resolve(objects);
        });
    });
}))
    .then(() => benchmark("Iridium find()",() => null,() => iDB.User.find().toArray(), "MongoDB find()"))
    .then(() => benchmark("Iridium Instances find()",() => null,() => iDB.UserWrapped.find().toArray(), "MongoDB find()"))

    .then(() => {
    return new Promise<any>((resolve, reject) => {
        iDB.db.collection("mongodb").deleteMany((err: Error, objects: any) => {
            if (err) return reject(err);
            return resolve(objects);
        });
    });
})
    .then(() => benchmark("MongoDB remove()",(objects) => {
    return new Promise<any>((resolve, reject) => {
        iDB.db.collection("mongodb").deleteMany(objects,(err, objects) => {
            if (err) return reject(err);
            return resolve(objects);
        });
    });
},() => {
        return new Promise<any>((resolve, reject) => {
            iDB.db.collection("mongodb").deleteMany((err: Error, objects: any) => {
                if (err) return reject(err);
                return resolve(objects);
            });
        });
    }))
    .then(() => iDB.User.remove())
    .then(() => benchmark("Iridium remove()",(objects) => iDB.User.insert(objects),() => iDB.User.remove(), "MongoDB remove()"))
    .then(() => iDB.UserWrapped.remove())

    .catch((err) => console.error(err))
    .then(() => iDB.close());