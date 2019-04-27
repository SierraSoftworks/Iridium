"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MongoDB = require("mongodb");
/**
 * Converts a Node.js Buffer into a MongoDB Binary object. This is a shortcut
 * for `new require("mongodb").Binary(buffer)`.
 * @param value The Buffer which you would like to convert into a Binary object
 */
function toBinary(value) {
    if (Buffer.isBuffer(value))
        return new MongoDB.Binary(value, MongoDB.Binary.SUBTYPE_BYTE_ARRAY);
    return value;
}
exports.toBinary = toBinary;
//# sourceMappingURL=Binary.js.map