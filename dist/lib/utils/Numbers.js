"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MongoDB = require("mongodb");
/**
 * Converts a string into a Decimal128 instance - a shortcut for
 * `require("mongodb").Decimal128.fromString(value)`.
 * @param value The string representation of a decimal number
 * @returns A MongoDB Decimal128 instance equivalent to the string you provided.
 */
function toDecimal128(value) {
    return MongoDB.Decimal128.fromString(value);
}
exports.toDecimal128 = toDecimal128;
/**
 * Converts a string into a Long instance - a shortcut for
 * `require("mongodb").Long.fromString(value)`.
 * @param value The string representation of a decimal number
 * @returns A MongoDB Long instance equivalent to the string you provided.
 */
function toLong(value) {
    if (typeof value === "number")
        return MongoDB.Long.fromNumber(value);
    else
        return MongoDB.Long.fromString(value);
}
exports.toLong = toLong;
//# sourceMappingURL=Numbers.js.map