/// <reference path="../nodelib/node.js"/>
/// <reference path="../nodelib/lodash.js"/>
/// <reference path="../nodelib/mocha.js"/>
/// <reference path="../nodelib/should.js"/>
/// <reference path="../lib/utils/validation.js"/>
/// <reference path="../lib/utils/transforms.js"/>

var _ = require('lodash');
var should = require('should');

describe('utils', function () {

	describe('validation', function () {
		var validation = require('../lib/utils/validation');
		function validate(schema, value, pass, message) {
			validation(schema, value).should.have.ownProperty('passed', pass, message);
		}

		it('should allow validation of basic types', function () {
			validate(true, undefined, false, 'Expected true:undefined to fail');
			validate(true, null, false, 'Expected true:null to fail');
			validate(true, '', false, 'Expected true:"" to fail');
			validate(true, 'hello', true, 'Expected true:"hello" to pass');

			validate(false, undefined, true, 'Expected false:undefined to pass');
			validate(false, '', true, 'Expected false:"" to pass');

			validate(Object, { test: 1 }, true, 'Expected Object:{test:1} to pass');

			validate(String, 1, false, 'Expected String:1 to fail');
			validate(String, 'hello', true, 'Expected String:"hello" to pass');

			validate(Number, 'hello', false, 'Expected Number:"hello" to fail');
			validate(Number, 1, true, 'Expected Number:1 to pass');
		});

		it('should allow validation of array elements', function () {
			validate([String], ['hello'], true, 'Expected [String]:["hello"] to pass');
			validate([Number], ['hello'], false, 'Expected [Number]:["hello"] to fail');
		});

		it('should allow validation of an array\'s minimum and maximum length', function () {
			validate([String, 1], [], false, 'Expected [String,1]:[] to fail');
			validate([String, 1, 2], ['a', 'b', 'c'], false, 'Expected [String,1,2]:["a","b","c"] to fail');
		});

		it('should allow validation of object properties', function () {
			validate({ name: String, age: Number }, { name: 'Benjamin Pannell', age: 20 }, true);
			validate({ name: String, age: Number }, { name: 'Benjamin Pannell', age: '20' }, false);
		});

		it('should allow validation of objects within arrays', function () {
			validate([{ name: String, age: Number }], [{ name: 'Benjamin Pannell', age: 20 }, { name: 'Billy Jean', age: 27 }], true);
			validate([{ name: String, age: Number }], [{ name: 'Benjamin Pannell', age: 20 }, { name: 'Billy Jean', age: '27' }], false);
		});

		it('shouldn\'t fail to correctly validate objects with a type field', function () {
			validate({ type: String, name: String }, { type: 'test', name: 'runner' }, true);
		});

		it('should allow validation of non-required typed properties', function () {
			validate({ $type: Number, $required: false }, null, true);
			validate({ $type: Number, $required: false }, 1, true);
			validate({ $type: Number, $required: false }, 'hello', false);
		});

		it('should allow validation using a regular expression', function () {
			validate(/test/, 'test', true);
			validate(/test/, 'fail', false);
		});

		it('should allow validation of an object map', function () {
			validate({ $propertyType: Number, $required: false }, null, true);
			validate({ $propertyType: Number }, null, false);
			validate({ $propertyType: Number }, {
				a: 1,
				b: 2
			}, true);
			validate({ $propertyType: Number }, {
				a: 1,
				b: 'b'
			}, false);
		});
	});

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