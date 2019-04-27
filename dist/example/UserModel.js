"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Iridium = require("../iridium");
const iridium_1 = require("../iridium");
var settings = {};
let User = class User extends Iridium.Instance {
    get username() {
        return this._id;
    }
    static onCreating(user) {
        var passwordTest = /(?=^.{8,}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/;
        if (!passwordTest.test(user.password || ""))
            return Promise.reject(new Error("Password didn\"t meet the minimum safe password requirements. Passwords should be at least 8 characters long, and contain at least 3 of the following categories: lowercase letters, uppercase letters, numbers, characters"));
        user.password = require("crypto").createHash("sha512").update(settings.security.salt).update(user.password).digest("hex");
        _.defaults(user, {
            type: "Player",
            banned: false,
            statistics: {
                won: 0,
                drawn: 0,
                lost: 0,
                incomplete: 0
            },
            skill: {
                matchmaking: 0,
                trend: 0,
                level: 0,
                xp: 0,
                current_level: 0,
                next_level: 1200
            },
            friends: [],
            friend_requests: [],
            pending_messages: [],
            sessions: [],
            last_seen: new Date()
        });
    }
    get API() {
        var $ = this;
        return {
            username: $.username,
            fullname: $.fullname,
            email: $.email,
            banned: $.banned,
            statistics: $.statistics,
            skill: {
                level: $.skill.level,
                xp: $.skill.xp
            },
            friends: $.friends,
            pending_messages: $.pending_messages,
            last_seen: $.last_seen
        };
    }
    setPassword(newPassword, callback) {
        /// <summary>Updates the user's stored password hash</summary>
        /// <param name="newPassword" type="String">The new password to use for the user</param>
        /// <param name="callback" type="Function">A function to be called once the user's password has been updated</param>
        var passwordTest = /(?=^.{8,}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/;
        if (!passwordTest.test(newPassword || ""))
            return callback(new Error("Password didn\"t meet the minimum safe password requirements. Passwords should be at least 8 characters long, and contain at least 3 of the following categories: lowercase letters, uppercase letters, numbers, characters"));
        var hashed = require("crypto").createHash("sha512").update(settings.security.salt).update(newPassword).digest("hex");
        this.password = hashed;
        this.save(callback);
    }
    checkPassword(password) {
        /// <summary>Checks whether a given password is correct for a user's account</summary>
        /// <param name="password" type="String">The password to validate against the user's password hash.</param>
        /// <returns type="Boolean"/>
        var hashed = require("crypto").createHash("sha512").update(settings.security.salt).update(password).digest("hex");
        return hashed == this.password;
    }
    addFriend(friend, callback) {
        this.save({ $push: { friends: friend } }, callback);
    }
    updateLevel() {
        /// <summary>Update"s the user"s current level based on the amount of XP they have. Doesn't save the user instance.</summary>
        // Amount of XP required per level starts at 1200, doubles for each consecutive level
        // tf. XP_n = XP_nm1 + 1200 * 2^n
        var remainingXP = this.skill.xp;
        var previousLevelXP = 0;
        var levelXP = 1200;
        var level = 0;
        for (; remainingXP >= levelXP; level++, previousLevelXP = levelXP, remainingXP -= levelXP, levelXP += 1200 * Math.pow(2, level))
            ;
        this.skill.level = level;
        this.skill.current_level = previousLevelXP;
        this.skill.next_level = levelXP;
    }
};
__decorate([
    Iridium.Property(/^[a-z][a-z0-9_]{7,}$/)
], User.prototype, "_id", void 0);
__decorate([
    iridium_1.Property(String)
], User.prototype, "fullname", void 0);
__decorate([
    iridium_1.Property(/^.+@.+$/)
], User.prototype, "email", void 0);
__decorate([
    iridium_1.Property("password")
], User.prototype, "password", void 0);
__decorate([
    iridium_1.Property(/Player|Moderator|Admin/)
], User.prototype, "type", void 0);
__decorate([
    iridium_1.Property(Boolean)
], User.prototype, "banned", void 0);
__decorate([
    iridium_1.Property({
        won: Number,
        drawn: Number,
        lost: Number,
        incomplete: Number
    })
], User.prototype, "statistics", void 0);
__decorate([
    iridium_1.Property({
        matchmaking: Number,
        trend: Number,
        level: Number,
        xp: Number,
        current_level: Number,
        next_level: Number
    })
], User.prototype, "skill", void 0);
__decorate([
    iridium_1.Property([String])
], User.prototype, "friends", void 0);
__decorate([
    iridium_1.Property([{
            from: String,
            time: Date,
            message: String,
            group: { $required: false, $type: String },
            game: { $required: false, $type: String }
        }])
], User.prototype, "pending_messages", void 0);
__decorate([
    iridium_1.Property([String])
], User.prototype, "sessions", void 0);
__decorate([
    iridium_1.Property([String])
], User.prototype, "friend_requests", void 0);
__decorate([
    iridium_1.Property(Date)
], User.prototype, "last_seen", void 0);
User = __decorate([
    Iridium.Collection("user"),
    iridium_1.Index({ email: 1 }, { unique: true }),
    iridium_1.Index({ sessions: 1 }, { sparse: true }),
    iridium_1.Index({ "skill.xp": -1 }, { background: true }),
    iridium_1.Validate("password", function (schema, data, path) {
        // This should use something like zxcvbn to determine whether a password
        // is strong enough for your use case.
        return this.assert(typeof data === "string" && /^.{8,}$/.test(data), "Expected password to be at least 8 characters long.");
    })
], User);
exports.User = User;
class Core extends Iridium.Core {
    constructor() {
        super(...arguments);
        this.Users = new Iridium.Model(this, User);
    }
}
let core = new Core("mongodb://localhost/iridium_users");
core.Users.findOne().then(function (user) {
    if (!user)
        throw new Error("Couldn't find a user");
    if (user.checkPassword("test"))
        return true;
    return false;
});
//# sourceMappingURL=UserModel.js.map