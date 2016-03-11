
/// <reference path="../iridium.d.ts" />
import Iridium = require("iridium");

interface UserDoc {
    _id?: string;
    username: string;
    fullname: string;
    email: string;
    dateOfBirth: Date;
    passwordHash: string;
    joined?: Date;
}

class User extends Iridium.Instance<UserDoc, User> implements UserDoc, Iridium.Hooks<UserDoc, User> {
    _id: string;
    username: string;
    fullname: string;
    email: string;
    dateOfBirth: Date;
    passwordHash: string;
    joined: Date;

    changePassword(newPassword: string) {
        this.passwordHash = newPassword.toLowerCase();
    }
    
    static onCreating(doc: UserDoc) {
        doc.joined = new Date();
    }
}

class MyDB extends Iridium.Core {
    Users = new Iridium.Model<UserDoc, User>(this, User, "users", {
        _id: false,
        username: /^[a-z][a-z0-9_]{7,}$/,
        fullname: String,
        email: String,
        dateOfBirth: Date,
        passwordHash: String,
        joined: Date
    }, {
        indexes: [
            { email: 1 }
        ]
    });

    PlainUsers = new Iridium.Model<UserDoc, UserDoc>(this,(model, doc) => doc, "users", {
        _id: false,
        username: /^[a-z][a-z0-9_]{7,}$/,
        fullname: String,
        email: String,
        dateOfBirth: Date,
        passwordHash: String,
        joined: Date
    }, {
        indexes: [
            { email: 1 }
        ]
    });
}

var db = new MyDB("mongodb://localhost/test");

db.connect().then(function () {
    db.Users.insert({ fullname: "test", username: "test", passwordHash: "test", email: "test@test.com", dateOfBirth: new Date() }).then(function (user) {
        user.fullname;
        user.dateOfBirth.getTime();
    });

    db.Users.insert([{ fullname: "test", username: "test", passwordHash: "test", email: "test@test.com", dateOfBirth: new Date() }]).then(function (users) {
        users[0].fullname;
    });
    
    db.Users.findOne().then(function (instance) {
        instance.save().then(function (i) {
            i.remove().then(function (i) {
                i.username = "test";
                return i.save();
            });
        });
    });
    
    db.Users.count().then(function (count) {
        count.toPrecision(2);
    });

    db.PlainUsers.get().then(function (plainUser) {
        plainUser.username;
    });
});