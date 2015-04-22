/// <reference path="../typings/concoction/concoction.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _ = require('lodash');
var Iridium = require('../index');
var Concoction = require('concoction');
var Promise = require('bluebird');
var settings = {};
var User = (function (_super) {
    __extends(User, _super);
    function User() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(User.prototype, "API", {
        get: function () {
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
        },
        enumerable: true,
        configurable: true
    });
    User.prototype.setPassword = function (newPassword, callback) {
        /// <summary>Updates the user's stored password hash</summary>
        /// <param name="newPassword" type="String">The new password to use for the user</param>
        /// <param name="callback" type="Function">A function to be called once the user's password has been updated</param>
        var passwordTest = /(?=^.{8,}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/;
        if (!passwordTest.test(newPassword || ''))
            return callback(new Error('Password didn\'t meet the minimum safe password requirements. Passwords should be at least 8 characters long, and contain at least 3 of the following categories: lowercase letters, uppercase letters, numbers, characters'));
        var hashed = require('crypto').createHash('sha512').update(settings.security.salt).update(newPassword).digest('hex');
        this.password = hashed;
        this.save(callback);
    };
    User.prototype.checkPassword = function (password) {
        /// <summary>Checks whether a given password is correct for a user's account</summary>
        /// <param name="password" type="String">The password to validate against the user's password hash.</param>
        /// <returns type="Boolean"/>
        var hashed = require('crypto').createHash('sha512').update(settings.security.salt).update(password).digest('hex');
        return hashed == this.password;
    };
    User.prototype.addFriend = function (friend, callback) {
        this.save({ $push: { friends: friend } }, callback);
    };
    User.prototype.updateLevel = function () {
        /// <summary>Update's the user's current level based on the amount of XP they have. Doesn't save the user instance.</summary>
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
    };
    return User;
})(Iridium.Instance);
exports.User = User;
function Users(core) {
    var schema = {
        username: /[a-z0-9]+(_[a-z0-9]+)*/,
        fullname: String,
        email: String,
        password: String,
        type: /Player|Moderator|Admin/,
        banned: Boolean,
        statistics: {
            won: Number,
            drawn: Number,
            lost: Number,
            incomplete: Number
        },
        skill: {
            matchmaking: Number,
            trend: Number,
            level: Number,
            xp: Number,
            current_level: Number,
            next_level: Number
        },
        friends: [String],
        pending_messages: [{
            from: String,
            time: Date,
            message: String,
            group: { $type: String, $required: false },
            game: { $type: String, $required: false }
        }],
        sessions: [String],
        friend_requests: [String],
        last_seen: Date
    };
    var options = {
        hooks: {
            creating: function (item) {
                item._id = item.username;
                if (item.username)
                    delete item.username;
                var passwordTest = /(?=^.{8,}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/;
                if (!passwordTest.test(item.password || ''))
                    return Promise.reject(new Error('Password didn\'t meet the minimum safe password requirements. Passwords should be at least 8 characters long, and contain at least 3 of the following categories: lowercase letters, uppercase letters, numbers, characters'));
                item.password = require('crypto').createHash('sha512').update(settings.security.salt).update(item.password).digest('hex');
                _.defaults(item, {
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
                return Promise.resolve();
            }
        },
        preprocessors: [
            new Concoction.Rename({
                _id: 'username'
            })
        ],
        indexes: [
            [{ email: 1 }, { unique: true, background: true }],
            [{ type: 1 }, { background: true }],
            [{ sessions: 1 }, { sparse: true, background: true }],
            [{ 'skill.xp': -1 }, { background: true }]
        ]
    };
    return new Iridium.Model(core, User, "users", schema, options);
}
exports.Users = Users;
var usrModel = Users(null);
usrModel.findOne().then(function (user) {
    if (user.checkPassword("test"))
        return true;
    return false;
});
//# sourceMappingURL=UserModel.js.map