/// <reference path="../nodelib/node.js"/>

var path = require('path');
var async = require('async');

module.exports.isCI = function() {
	return !!process.env.CI_SERVER;
};

module.exports.extend = function (original, merge) {
	var merged = {};
	for(var k in original) {
		merged[k] = merge.hasOwnProperty(k) ? merge[k] : original[k];
	}
	return merged;
};

module.exports.hasConfig = function () {
	var config;

	try {
		config = module.exports.getConfig();
	} catch (ex) {
		return 'not-found';
	}

	return 'found';
};

var config = null;

module.exports.getConfig = function () {
	if (module.exports.isCI()) {
		return config || (config = module.exports.extend(require('../settings'), {
			user: "iridium",
			password: "",
			database: "iridium"
		}));
	} else {
		return config || (config = require("./config"));
	}
};