"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skmatc = require("skmatc");
/**
 * Specifies a custom validator to be made available for this collection's schema.
 * More than one instance of this decorator may be used if you wish to specify multiple validators.
 * @param {Object} forType The value in the schema which will be delegated to this function for validation.
 * @param {function} validate A function which calls this.assert(condition) to determine whether a schema node is valid or not.
 *
 * This decorator replaces the use of the static validators property on instance implementation
 * classes. If your transpiler does not support decorators then you are free to make use of the
 * property instead.
 *
 * @example
 * @Iridium.Validate('everything', function(schema, data, path) {
 * 		return this.assert(data == 42, "Expected the answer to life, the universe and everything.");
 * })
 */
function Validate(forType, validate) {
    return function (target) {
        target.validators = (target.validators || []).concat(Skmatc.create(schema => schema === forType, validate));
    };
}
exports.Validate = Validate;
//# sourceMappingURL=Validation.js.map