"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Iridium = require("../iridium");
let User = class User extends Iridium.Instance {
    changePassword(newPassword) {
        this.passwordHash = newPassword.toLowerCase();
    }
    static onCreating(doc) {
        doc.joined = new Date();
    }
};
__decorate([
    Iridium.ObjectID
], User.prototype, "_id", void 0);
__decorate([
    Iridium.Property(String)
], User.prototype, "username", void 0);
__decorate([
    Iridium.Property(String)
], User.prototype, "fullname", void 0);
__decorate([
    Iridium.Property(String)
], User.prototype, "email", void 0);
__decorate([
    Iridium.Property(Date)
], User.prototype, "dateOfBirth", void 0);
__decorate([
    Iridium.Property(String)
], User.prototype, "passwordHash", void 0);
__decorate([
    Iridium.Property(Date)
], User.prototype, "joined", void 0);
User = __decorate([
    Iridium.Collection("users"),
    Iridium.Index({ email: 1 }, { unique: true })
], User);
class MyDB extends Iridium.Core {
    constructor() {
        super(...arguments);
        this.Users = new Iridium.Model(this, User);
    }
}
var db = new MyDB("mongodb://localhost/test");
db.connect().then(function () {
    db.Users.insert({
        fullname: "test",
        username: "test",
        passwordHash: "test",
        email: "test@test.com",
        dateOfBirth: new Date()
    }).then(user => {
        user.dateOfBirth.getTime();
    });
    db.Users.insert([{
            fullname: "test",
            username: "test",
            passwordHash: "test",
            email: "test@test.com",
            dateOfBirth: new Date()
        }]).then(users => {
        users[0].fullname;
    });
    db.Users.findOne().then(user => {
        if (!user)
            throw new Error("User could not be found...");
        user.save().then(user => {
            user.remove().then(user => {
                user.username = "test";
                return user.save();
            });
        });
    });
    db.Users.count().then(count => {
        count.toPrecision(2);
    });
});
//# sourceMappingURL=IntelliSense.js.map