/// <reference path="../nodelib/node.js"/>
/// <reference path="../nodelib/lodash.js"/>
/// <reference path="../nodelib/mocha.js"/>
/// <reference path="../nodelib/should.js"/>
/// <reference path="../lib/utils/validation.js"/>
/// <reference path="../lib/utils/transforms.js"/>

var _ = require('lodash');
var should = require('should');

describe('utils', function () {
	describe('transforms', function () {
		var transform = require('../lib/utils/transforms');

		it('should allow the transformation of an object\'s properties', function () {
			var original = {
				a: 'a',
				b: 1,
				c: 'c',
				d: 'd'
			};

			var expected = {
				a: 'aa',
				b: 1,
				c: 'c',
				d: 'd'
			};

			var trans = {
				a: { $t: function (value) { return value + value; } },
				b: false,
				c: { $t: false }
			};

			transform(trans, '$t', original);

			original.should.eql(expected);
		});

		it('should remove properties where the transform returns undefined', function () {
			var original = {
				a: 1
			};

			var expected = {
				b: '1'
			};

			var trans = {
				a: { $t: function (value) { return undefined; } },
				b: { $t: function (value) { return '1'; } }
			};
		});
	});
});