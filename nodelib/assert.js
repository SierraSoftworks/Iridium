/// <reference path="core.js" />
(function () {
    var assert = require.modules.assert = function (value, message) {
        /// <summary>
        /// This module is used for writing unit tests for your applications, you can access it with require('assert').
        /// </summary>
        /// <param name='value' type='Object'>truthy</param>
        /// <param name='message' type='String' optional='true' />
    };
    assert.fail = function (actual, expected, message, operator) {
        /// <summary>
        /// Throws an exception that displays the values for `actual` and `expected` separated by the provided operator.
        /// </summary>
        /// <param name='actual' type='Object'></param>
        /// <param name='expected' type='Object'></param>
        /// <param name='message' type='String' />
        /// <param name='operator' type='String' />
    };
    assert.ok = function (value, message) {
        /// <summary>
        /// Tests if value is a `true` value, it is equivalent to assert.equal(true, value, message);
        /// </summary>
        /// <param name='value' type='Object'>truthy</param>
        /// <param name='message' type='String' optional='true' />
    };
    assert.equal = function (actual, expected, message) {
        /// <summary>
        /// Tests shallow, coercive equality with the equal comparison operator ( == ).
        /// </summary>
        /// <param name='actual' type='Object'></param>
        /// <param name='expected' type='Object'></param>
        /// <param name='message' type='String' optional='true' />
    };
    assert.notEqual = function (actual, expected, message) {
        /// <summary>
        /// Tests shallow, coercive non-equality with the not equal comparison operator ( != ).
        /// </summary>
        /// <param name='actual' type='Object'></param>
        /// <param name='expected' type='Object'></param>
        /// <param name='message' type='String' optional='true' />
    };
    assert.deepEqual = function (actual, expected, message) {
        /// <summary>Tests for deep equality.</summary>
        /// <param name='actual' type='Object'></param>
        /// <param name='expected' type='Object'></param>
        /// <param name='message' type='String' optional='true' />
    };
    assert.notDeepEqual = function (actual, expected, message) {
        /// <summary>Tests for any deep inequality.</summary>
        /// <param name='actual' type='Object'></param>
        /// <param name='expected' type='Object'></param>
        /// <param name='message' type='String' optional='true' />
    };
    assert.strictEqual = function (actual, expected, message) {
        /// <summary>
        /// Tests strict equality, as determined by the strict equality operator ( === )
        /// </summary>
        /// <param name='actual' type='Object'></param>
        /// <param name='expected' type='Object'></param>
        /// <param name='message' type='String' optional='true' />
    };
    assert.notStrictEqual = function (actual, expected, message) {
        /// <summary>
        /// Tests strict non-equality, as determined by the strict not equal operator ( !== )
        /// </summary>
        /// <param name='actual' type='Object'></param>
        /// <param name='expected' type='Object'></param>
        /// <param name='message' type='String' optional='true' />
    };
    assert.throws = function (block, error, message) {
        /// <summary>
        /// Expects `block` to throw an error. error can be constructor, regexp or  validation function.
        /// </summary>
        /// <param name='block' type='Object'></param>
        /// <param name='error' type='Object' optional='true' ></param>
        /// <param name='message' type='String' optional='true' />
    };
    assert.doesNotThrow = function (block, error, message) {
        /// <summary>
        /// Expects `block` not to throw an error, see assert.throws for details.
        /// </summary>
        /// <param name='block' type='Object'></param>
        /// <param name='error' type='Object' optional='true' ></param>
        /// <param name='message' type='String' optional='true' />
    };
    assert.ifError = function (value) {
        /// <summary>
        /// Tests if value is not a false value, throws 
        /// if it is a true value. Useful when testing the first argument, `error` in callbacks.
        /// </summary>
        /// <param name='value' type='Object'></param>
    };
})();
