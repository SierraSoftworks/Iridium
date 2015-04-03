
import Iridium = require('../index');
import Instance = require('../lib/Instance');


interface IUser {
    username: string;
    fullname: string;
    email: string;
    dateOfBirth: Date;
    passwordHash: string;
}

interface IUserInstance extends IUser, Instance.IInstance<IUser, IUserInstance> {}

class MyDB extends Iridium {
    Users = new Iridium.Model<IUser, IUserInstance>(this, "users", {
        username: /^[a-z][a-z0-9_]{7,}$/,
        fullname: String,
        email: String,
        dateOfBirth: Date,
        passwordHash: String
    }, {
            indexes: [
                { email: 1 }
            ]
    });
}

var db = new MyDB("mongodb://localhost/test");

db.connect().then(function () {
    db.Users.insert({ fullname: 'test', username: 'test', passwordHash: 'test', email: 'test@test.com', dateOfBirth: new Date() }).then(function (user) {
        user.fullname;
        user.dateOfBirth.getTime();
    });

    db.Users.insert([{ fullname: 'test', username: 'test', passwordHash: 'test', email: 'test@test.com', dateOfBirth: new Date() }]).then(function (users) {
        users[0].fullname;
    });
    
    db.Users.findOne().then(function (instance: IUserInstance) {
        instance.save().then(function (i) {
            i.remove().then(function (i) {
                i.username = 'test';
                return i.save();
            });
        });
    });
    
    db.Users.count().then(function (count) {
        count.toPrecision(2);
    });
});