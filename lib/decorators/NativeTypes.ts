import { Property } from "./Schema";
import * as MongoDB from "mongodb";
import { Instance } from "../Instance";
import { Transform } from "./Transforms";
import { DefaultTransforms } from "../Transforms";
import { InstanceImplementation } from "../InstanceInterface";

/**
 * Specifies that this property should be treated as an ObjectID, with the requisite validator and transforms.
 *
 * This decorator applies an ObjectID validator to the property, which ensures that values sent to the database
 * are instances of the MongoDB ObjectID type, as well as applying a transform operation which converts ObjectIDs
 * to strings for your application, and then converts strings back to ObjectIDs for the database.
 */
export function ObjectID<
    TInstance extends Instance<any, TInstance> = any,
    K extends keyof TInstance = any
>(target: TInstance, name: K) {
	Property(MongoDB.ObjectID)(target, <any>name);
	Transform(
		DefaultTransforms.ObjectID.fromDB,
		DefaultTransforms.ObjectID.toDB
	)(target, name);
}

/**
 * Specifies that this property should be stored using the MongoDB binary type and represented as a Buffer.
 * 
 * This decorator applies a Buffer validator to the property, which ensures that values you send to the database
 * are well formatted Buffer objects represented using the BSON Binary datatype. In addition to this, it will
 * apply a transform which ensures you only work with Buffer objects and that data is always stored in Binary
 * format.
 */
export function Binary<
    TInstance extends Instance<any, TInstance> = any,
    K extends keyof TInstance = any
>(target: TInstance, name: K) {
	Property(Buffer)(target, <any>name);
	Transform(
		DefaultTransforms.Binary.fromDB,
		DefaultTransforms.Binary.toDB
	)(target, name);
}