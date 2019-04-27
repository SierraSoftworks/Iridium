"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = require("./Schema");
const MongoDB = require("mongodb");
const Transforms_1 = require("./Transforms");
const Transforms_2 = require("../Transforms");
/**
 * Specifies that this property should be treated as an ObjectID, with the requisite validator and transforms.
 *
 * This decorator applies an ObjectID validator to the property, which ensures that values sent to the database
 * are instances of the MongoDB ObjectID type, as well as applying a transform operation which converts ObjectIDs
 * to strings for your application, and then converts strings back to ObjectIDs for the database.
 */
function ObjectID(target, name) {
    Schema_1.Property(MongoDB.ObjectID)(target, name);
    Transforms_1.Transform(Transforms_2.DefaultTransforms.ObjectID.fromDB, Transforms_2.DefaultTransforms.ObjectID.toDB)(target, name);
}
exports.ObjectID = ObjectID;
/**
 * Specifies that this property should be stored using the MongoDB binary type and represented as a Buffer.
 *
 * This decorator applies a Buffer validator to the property, which ensures that values you send to the database
 * are well formatted Buffer objects represented using the BSON Binary datatype. In addition to this, it will
 * apply a transform which ensures you only work with Buffer objects and that data is always stored in Binary
 * format.
 */
function Binary(target, name) {
    Schema_1.Property(Buffer)(target, name);
    Transforms_1.Transform(Transforms_2.DefaultTransforms.Binary.fromDB, Transforms_2.DefaultTransforms.Binary.toDB)(target, name);
}
exports.Binary = Binary;
//# sourceMappingURL=NativeTypes.js.map