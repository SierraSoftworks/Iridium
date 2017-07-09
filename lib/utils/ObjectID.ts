import * as MongoDB from "mongodb";

/**
 * Converts a string to an ObjectID instance - a shortcut for require("mongodb").ObjectID.createFromHexString
 *
 * @param value The string representation of the ObjectID you wish to create.
 * @returns A MongoDB ObjectID instance equivalent to the string you provided.
 *
 * You should be aware that this method performs no validation on the received string, MongoDB's ObjectID requires
 * that it either be a 12 byte UTF8 string, or a 24 byte hexadecimal string in order to be converted correctly.
 *
 * This method removes the need for your application to directly depend on MongoDB's Node.js client library,
 * which helps clean up your code a bit and reduces the headache of maintaining two different versions of the
 * library (since Iridium also has one).
 */
export function toObjectID(value: string): MongoDB.ObjectID {
	return MongoDB.ObjectID.createFromHexString(value);
}

/**
 * Type guard method which determines whether an object has an _id field
 * present.
 * @param object The object to test for a _id field.
 * @return Boolean indicating whether the object has an _id field present.
 */
export function hasObjectID(object: any): object is { _id?: any; } {
	return typeof object === "object" && object.hasOwnProperty("_id");
}

/**
 * Type guard method which determines whether an object has an _id field
 * present and populated.
 * @param object The object to test for a _id field.
 * @return Boolean indicating whether the object has an _id field present.
 */
export function hasValidObjectID(object: any): object is { _id: any; } {
	return typeof object === "object" && object._id !== undefined && object._id !== null;
}