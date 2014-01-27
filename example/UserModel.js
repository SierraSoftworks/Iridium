/// <reference path="../index.js"/>

var _ = require('lodash');
var Database = require('../index.js');
var Model = Database.Model;
var Concoction = require('concoction');

module.exports = function (db) {
	/// <summary>Configure the User model to use the given database</summary>
	/// <param name="db" type="Database">The database connection to use</param>
	/// <returns type="Model"/>

	"use strict";
	var database = db;
	
	var options = {
		virtuals: {
			API: function () {
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
		},
		methods: {
			setPassword: function (newPassword, callback) {
				/// <summary>Updates the user's stored password hash</summary>
				/// <param name="newPassword" type="String">The new password to use for the user</param>
				/// <param name="callback" type="Function">A function to be called once the user's password has been updated</param>

				var passwordTest = /(?=^.{8,}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/;
				if (!passwordTest.test(newPassword || '')) return callback(new Error('Password didn\'t meet the minimum safe password requirements. Passwords should be at least 8 characters long, and contain at least 3 of the following categories: lowercase letters, uppercase letters, numbers, characters'));
				
				var hashed = require('crypto').createHash('sha512').update(database.settings.security.salt).update(newPassword).digest('hex');
				this.password = hashed;
				this.save(callback);
			},
			checkPassword: function (password) {
				/// <summary>Checks whether a given password is correct for a user's account</summary>
				/// <param name="password" type="String">The password to validate against the user's password hash.</param>
				/// <returns type="Boolean"/>

				var hashed = require('crypto').createHash('sha512').update(database.settings.security.salt).update(password).digest('hex');
				return hashed == this.password;
			},
			addFriend: function (friend, callback) {
				this.save({ $push: { friends: friend } }, callback);
			},
			updateLevel: function () {
				/// <summary>Update's the user's current level based on the amount of XP they have. Doesn't save the user instance.</summary>
				
				// Amount of XP required per level starts at 1200, doubles for each consecutive level
				// tf. XP_n = XP_nm1 + 1200 * 2^n

				var remainingXP = this.skill.xp;

				var previousLevelXP = 0;
				var levelXP = 1200;
				var level = 0;

				for(; remainingXP >= levelXP; level++, previousLevelXP = levelXP, remainingXP -= levelXP, levelXP += 1200 * Math.pow(2, level));

				this.skill.level = level;
				this.skill.current_level = previousLevelXP;
				this.skill.next_level = levelXP;
			}
		},
		hooks: {
			creating: function (done) {
				var item = this;

				item._id = item.username;
				if (item.username) delete item.username;

				var passwordTest = /(?=^.{8,}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/;

				if (!passwordTest.test(item.password || '')) return done('Password didn\'t meet the minimum safe password requirements. Passwords should be at least 8 characters long, and contain at least 3 of the following categories: lowercase letters, uppercase letters, numbers, characters');

				item.password = require('crypto').createHash('sha512').update(database.settings.security.salt).update(item.password).digest('hex');

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

				done();
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

	var schema = {
		_id: /[a-z0-9]+(_[a-z0-9]+)*/,
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

	return new Model(db, 'user', schema, options);
};
