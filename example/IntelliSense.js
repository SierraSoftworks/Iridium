var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Iridium = require('../index');
var User = (function (_super) {
    __extends(User, _super);
    function User() {
        _super.apply(this, arguments);
    }
    User.prototype.changePassword = function (newPassword) {
        this.passwordHash = newPassword.toLowerCase();
    };
    return User;
})(Iridium.Instance);
var MyDB = (function (_super) {
    __extends(MyDB, _super);
    function MyDB() {
        _super.apply(this, arguments);
        this.Users = new Iridium.Model(this, User, "users", {
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
        this.PlainUsers = new Iridium.Model(this, function (doc) { return doc; }, "users", {
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
    return MyDB;
})(Iridium.Core);
var db = new MyDB("mongodb://localhost/test");
db.connect().then(function () {
    db.Users.insert({ fullname: 'test', username: 'test', passwordHash: 'test', email: 'test@test.com', dateOfBirth: new Date() }).then(function (user) {
        user.fullname;
        user.dateOfBirth.getTime();
    });
    db.Users.insert([{ fullname: 'test', username: 'test', passwordHash: 'test', email: 'test@test.com', dateOfBirth: new Date() }]).then(function (users) {
        users[0].fullname;
    });
    db.Users.findOne().then(function (instance) {
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
    db.PlainUsers.get().then(function (plainUser) {
        plainUser.username;
    });
});
//# sourceMappingURL=IntelliSense.js.map