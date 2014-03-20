var _ = require('lodash');
var should = require('should');

describe('utils', function () {

    describe('validation', function () {
        var validation = require('../lib/utils/validation.js');
        function validate(schema, value, pass, message, extra) {
            var result = validation(schema, value, '', extra);
            result.should.have.ownProperty('passed', pass, message);
            return result;
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

        it('should allow conversion of a failure to an error object', function() {
            var result = validate({ name: Number }, { name: 'Test' }, false);
            result.should.have.ownProperty('toError');
            should(result.toError() instanceof Error);
        });

        it('should allow the use of extra validators', function() {
            var extra = function(schema, value, propertyName) {
                if(schema == 'Positive')
                    return this.assert(value >= 0, 'positive real number', value);
            };

            var result = validation({ positive: 'Positive' }, { positive: 1 }, undefined, [extra]);
            result.should.have.ownProperty('passed', true);

            validate({ positive: 'Positive', normal: Number }, { positive: 1, normal: -1 }, true, 
                'Expected a positive integer to pass validation', [extra]);
            validate({ positive: 'Positive', normal: Number }, { positive: -1, normal: -1 }, false, 
                'Expected a negative integer to fail validation', [extra]);
        });
    });
});