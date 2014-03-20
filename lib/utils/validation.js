var _ = require('lodash');
require('./String');


(require.modules || {}).validation = module.exports = validateType;

function validateType(schemaType, value, property, extra) {
    /// <signature>
    /// <summary>Validates the given value against a specified schema type field</summary>
    /// <param name="schemaType" type="Mixed">The type of data specified to be contained within the Schema</param>
    /// <param name="value" type="Mixed">The data to validate</param>
    /// <param name="extra" type="Array" elementType="Function">Additional validation engines</param>
    /// </signature>

    "use strict";

    var fail = function (expected, got) {
        /// <signature>
        /// <summary>Logs a failure reason to the application error log</summary>
        /// <param name="expected" type="String">A description of what was expected by the validator</param>
        /// </signature>
        /// <signature>
        /// <summary>Logs a failure reason to the application error log</summary>
        /// <param name="expected" type="String">A description of what was expected by the validator</param>
        /// <param name="got" type="String">The acctual value</param>
        /// </signature>

        if (!got) got = value;
        
        return {
            passed: false,
            reason: {
                property: property,
                expected: expected,
                got: got
            },
            toError: function () {
                var error = null;
                if (this.reason.property) error = new Error(String.format('Failed to validate, expected value of {0} to be a {1} but got {2}', this.reason.property, this.reason.expected, this.reason.got || 'nothing'));
                else error = Error(String.format('Failed to validate, expected {0} but got {1}', this.reason.expected, this.reason.got || 'nothing'));

                error.isValidationError = true;
                error.property = this.reason.property;
                error.expected = this.reason.expected;
                error.got = this.reason.got;
                return error;
            }
        };
    };

    var pass = {
        passed: true
    };

    var assert = function (condition, expected, got) {
        /// <signature>
        /// <summary>Checks if a condition is met and returns a failure object if it is not</summary>
        /// <param name="condition" type="Boolean">The condition to check</param>
        /// <param name="expected" type="String">A description of what was expected by the validator</param>
        /// </signature>
        /// <signature>
        /// <summary>Logs a failure reason to the application error log</summary>
        /// <param name="condition" type="Boolean">The condition to check</param>
        /// <param name="expected" type="String">A description of what was expected by the validator</param>
        /// <param name="got" type="String">The acctual value</param>
        /// </signature>

        if (condition) return pass;

        return fail(expected, got);
    };
    
    var propertyPrefix = property ? (property + '.') : '';

    if (!schemaType) return pass;

    if (schemaType === true) return assert(value, 'value', value || 'nothing');

    if (schemaType === Object) return pass;
    if (_.isPlainObject(schemaType)) {
        if (schemaType.$type) {
            if (schemaType.$required === false && !value) return pass;
            return validateType(schemaType.$type, value, property, extra);
        }
        else if (schemaType.$propertyType) {
            if (schemaType.$required === false && !value) return pass;

            // Check sub properties
            for (var k in value) {
                var result = validateType(schemaType.$propertyType, value[k], propertyPrefix + k, extra);
                if (!result.passed) return result;
            }
            return pass;
        }
        else {
            if (!value) return fail('value');

            // Check sub properties
            for (var k in schemaType) {
                var result = validateType(schemaType[k], value[k], propertyPrefix + k, extra);
                if (!result.passed) return result;
            }
            return pass;
        }
    }
    if (Array.isArray(schemaType)) {
        if (!Array.isArray(value)) return fail('array');

        // Validate array values
        for (var i = 0; i < value.length; i++) {
            var result = validateType(schemaType[0], value[i], property + '[' + i + ']', extra);
            if (!result.passed) return result;
        }

        if (schemaType.length > 1 && value.length < schemaType[1]) return fail('array with a min length of ' + schemaType[1], value.length); // Minimum element count
        if (schemaType.length > 2 && value.length > schemaType[2]) return fail('array with a max length of ' + schemaType[2], value.length); // Maximum element count
        
        return pass;
    }

    if (schemaType === String) return assert(_.isString(value), 'string');
    if (schemaType === Number) return assert(_.isNumber(value), 'number');
    if (schemaType === Boolean) return assert(_.isBoolean(value), 'boolean');
    if (schemaType === Date) return assert(_.isDate(value), 'date');
    if (schemaType instanceof RegExp) return assert(schemaType.test(value || ''), 'regex match on ' + schemaType.toString(), (value || 'nothing').toString());
    
    if(extra) {
        var virtualThis = {
            fail: fail,
            assert: assert,
            pass: pass
        };

        for(var i = 0; i < extra.length; i++) {
            var result = extra[i].call(virtualThis, schemaType, value, property);
            if(result) return result;
        }
    }

    return pass;
};