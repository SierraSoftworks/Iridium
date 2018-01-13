import _ = require("lodash");
import * as Iridium from "../iridium";
import {Index, Property, Validate} from "../iridium";

var settings: any = {};

export interface UserDocument {
    _id: string;
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

@Iridium.Collection("user")
@Index({ email: 1 }, { unique: true })
@Index({ sessions: 1 }, { sparse: true })
@Index({ "skill.xp": -1 }, { background: true })
@Validate("password", function(schema, data, path) {
    // This should use something like zxcvbn to determine whether a password
    // is strong enough for your use case.
    return this.assert(typeof data === "string" && /^.{8,}$/.test(data), "Expected password to be at least 8 characters long.");
})
export class User extends Iridium.Instance<UserDocument, User> implements UserDocument {
    @Iridium.Property(/^[a-z][a-z0-9_]{7,}$/) _id: string;
    get username() {
        return this._id;
    }

    @Property(String) fullname: string;
    @Property(/^.+@.+$/) email: string;
    @Property("password") password: string;
    @Property(/Player|Moderator|Admin/) type: string;
    @Property(Boolean) banned: boolean;

    @Property({
        won: Number,
        drawn: Number,
        lost: Number,
        incomplete: Number
    })
    statistics: {
        won: number;
        drawn: number;
        lost: number;
        incomplete: number;
    };
    
    @Property({
        matchmaking: Number,
        trend: Number,
        level: Number,
        xp: Number,
        current_level: Number,
        next_level: Number
    })
    skill: {
        matchmaking: number;
        trend: number;
        level: number;
        xp: number;
        current_level: number;
        next_level: number;
    };
    
    @Property([String])
    friends: string[];

    @Property([{
        from: String,
        time: Date,
        message: String,
        group: { $required: false, $type: String },
        game: { $required: false, $type: String }
    }])    
    pending_messages: {
        from: string;
        time: Date;
        message: string;
        group?: string;
        game?: string;
    }[];
    
    @Property([String])
    sessions: string[];
    
    @Property([String])
    friend_requests: string[];
    
    @Property(Date)
    last_seen: Date;

    static onCreating(user: UserDocument) {
        var passwordTest = /(?=^.{8,}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/;

        if (!passwordTest.test(user.password || "")) return Promise.reject(new Error("Password didn\"t meet the minimum safe password requirements. Passwords should be at least 8 characters long, and contain at least 3 of the following categories: lowercase letters, uppercase letters, numbers, characters"));

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

    setPassword(newPassword: string, callback: (err: Error, user?: User) => void) {
        /// <summary>Updates the user's stored password hash</summary>
        /// <param name="newPassword" type="String">The new password to use for the user</param>
        /// <param name="callback" type="Function">A function to be called once the user's password has been updated</param>

        var passwordTest = /(?=^.{8,}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/;
        if (!passwordTest.test(newPassword || "")) return callback(new Error("Password didn\"t meet the minimum safe password requirements. Passwords should be at least 8 characters long, and contain at least 3 of the following categories: lowercase letters, uppercase letters, numbers, characters"));

        var hashed = require("crypto").createHash("sha512").update(settings.security.salt).update(newPassword).digest("hex");
        this.password = hashed;
        this.save(callback);
    }
    checkPassword(password: string): boolean {
        /// <summary>Checks whether a given password is correct for a user's account</summary>
        /// <param name="password" type="String">The password to validate against the user's password hash.</param>
        /// <returns type="Boolean"/>

        var hashed = require("crypto").createHash("sha512").update(settings.security.salt).update(password).digest("hex");
        return hashed == this.password;
    }
    addFriend(friend: string, callback: (err: Error, user?: User) => void) {
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

        for (; remainingXP >= levelXP; level++ , previousLevelXP = levelXP, remainingXP -= levelXP, levelXP += 1200 * Math.pow(2, level));

        this.skill.level = level;
        this.skill.current_level = previousLevelXP;
        this.skill.next_level = levelXP;
    }
}

class Core extends Iridium.Core {
    Users = new Iridium.Model<UserDocument, User>(this, User);
}

let core = new Core("mongodb://localhost/iridium_users");
core.Users.findOne().then(function (user) {
    if (!user) throw new Error("Couldn't find a user");
    if (user.checkPassword("test")) return true;
    return false;
});
