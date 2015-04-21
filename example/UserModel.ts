/// <reference path="../typings/concoction/concoction.d.ts" />

import _ = require('lodash');
import Iridium = require('../index');
import Concoction = require('concoction');
import Promise = require('bluebird');

export interface UserDocument {
    username: string;
    fullname: string;
    email: string;
    password: string;
    type: string;
    banned: boolean;
    statistics: {
        won: number;
        drawn: number;
        lost: number;
        incomplete: number;
    };
    skill: {
        matchmaking: number;
        trend: number;
        level: number;
        xp: number;
        current_level: number;
        next_level: number;
    };
    friends: string[];

    pending_messages: {
        from: string;
        time: Date;
        message: string;
        group?: string;
        game?: string;
    }[];
    sessions: string[];
    friend_requests: string[];
    last_seen: Date;
}

export class User extends Iridium.Instance<UserDocument, User> implements UserDocument {
    username: string;
    fullname: string;
    email: string;
    password: string;
    type: string;
    banned: boolean;
    statistics: {
        won: number;
        drawn: number;
        lost: number;
        incomplete: number;
    };
    skill: {
        matchmaking: number;
        trend: number;
        level: number;
        xp: number;
        current_level: number;
        next_level: number;
    };
    friends: string[];

    pending_messages: {
        from: string;
        time: Date;
        message: string;
        group?: string;
        game?: string;
    }[];
    sessions: string[];
    friend_requests: string[];
    last_seen: Date;

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

    setPassword(newPassword: string, callback: (err?: Error, user?: User) => void) {
        /// <summary>Updates the user's stored password hash</summary>
        /// <param name="newPassword" type="String">The new password to use for the user</param>
        /// <param name="callback" type="Function">A function to be called once the user's password has been updated</param>

        var passwordTest = /(?=^.{8,}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/;
        if (!passwordTest.test(newPassword || '')) return callback(new Error('Password didn\'t meet the minimum safe password requirements. Passwords should be at least 8 characters long, and contain at least 3 of the following categories: lowercase letters, uppercase letters, numbers, characters'));

        var hashed = require('crypto').createHash('sha512').update(core.settings.security.salt).update(newPassword).digest('hex');
        this.password = hashed;
        this.save(callback);
    }
    checkPassword(password: string): boolean {
        /// <summary>Checks whether a given password is correct for a user's account</summary>
        /// <param name="password" type="String">The password to validate against the user's password hash.</param>
        /// <returns type="Boolean"/>

        var hashed = require('crypto').createHash('sha512').update(core.settings.security.salt).update(password).digest('hex');
        return hashed == this.password;
    }
    addFriend(friend: string, callback: (err?: Error, user?: User) => void) {
        this.save({ $push: { friends: friend } }, callback);
    }
    updateLevel() {
        /// <summary>Update's the user's current level based on the amount of XP they have. Doesn't save the user instance.</summary>
				
        // Amount of XP required per level starts at 1200, doubles for each consecutive level
        // tf. XP_n = XP_nm1 + 1200 * 2^n

        var remainingXP = this.skill.xp;

        var previousLevelXP = 0;
        var levelXP = 1200;
        var level = 0;

        for (; remainingXP >= levelXP; level++ , previousLevelXP = levelXP, remainingXP -= levelXP, levelXP += 1200 * Math.pow(2, level));

        this.skill.level = level;
        this.skill.current_level = previousLevelXP;
        this.skill.next_level = levelXP;
    }
}

export function Users(core: Iridium.Core): Iridium.Model<UserDocument, User> {
    var schema: Iridium.Schema = {
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
                if (item.username) delete item.username;

                var passwordTest = /(?=^.{8,}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/;

                if (!passwordTest.test(item.password || '')) return Promise.reject(new Error('Password didn\'t meet the minimum safe password requirements. Passwords should be at least 8 characters long, and contain at least 3 of the following categories: lowercase letters, uppercase letters, numbers, characters'));

                item.password = require('crypto').createHash('sha512').update(core.settings.security.salt).update(item.password).digest('hex');

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

                return Promise.resolve()
            }
        },
        preprocessors: [
            Concoction.Rename({
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

    return new Iridium.Model<UserDocument, User>(core, User, "users", schema, options);
}

var usrModel = Users(null);
usrModel.findOne().then(function (user) {
    if (user.checkPassword("test")) return true;
    return false;
});
