import * as MongoDB from "mongodb";

/**
 * Converts a Node.js Buffer into a MongoDB Binary object. This is a shortcut
 * for `new require("mongodb").Binary(buffer)`.
 * @param value The Buffer which you would like to convert into a Binary object
 */
export function toBinary(value: Buffer): MongoDB.Binary {
    if (Buffer.isBuffer(value))
        return new MongoDB.Binary(value, MongoDB.Binary.SUBTYPE_BYTE_ARRAY)
    return value
}