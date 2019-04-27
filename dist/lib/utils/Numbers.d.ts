import * as MongoDB from "mongodb";
/**
 * Converts a string into a Decimal128 instance - a shortcut for
 * `require("mongodb").Decimal128.fromString(value)`.
 * @param value The string representation of a decimal number
 * @returns A MongoDB Decimal128 instance equivalent to the string you provided.
 */
export declare function toDecimal128(value: string): MongoDB.Decimal128;
/**
 * Converts a string into a Long instance - a shortcut for
 * `require("mongodb").Long.fromString(value)`.
 * @param value The string representation of a decimal number
 * @returns A MongoDB Long instance equivalent to the string you provided.
 */
export declare function toLong(value: string | number): MongoDB.Long;
