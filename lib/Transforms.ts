import MongoDB = require("mongodb");
import {Model} from "./Model";
import * as BSON from "./BSON"; 

export interface Transforms {
	/**
	 * A transform which is applied to the entire document.
	 */
	$document?: PropertyTransform<any>;
	[property:string]: PropertyTransform<any>;
}

/**
 * Converts the value of a property to and from its database representation.
 */
export interface PropertyTransform<T> {
	/**
	 * Converts a property's value from its database representation into one
	 * suitable for the application.
	 * @param value The value stored in the MongoDB database document.
	 * @param property The name of the document property to which this transform is being applied.
	 * @param model The Iridium Model on which this transform is being applied
	 * @returns A derived value which is more useful to the application.
	 */
	fromDB(value: T, property: string, model: Model<any,any>): any;

	/**
	 * Converts a property's value into a representation more suitable for
	 * the database.
	 * @param value The value used by the application.
	 * @param property The name of the document property to which this transform is being applied.
	 * @param model The Iridium Model on which this transform is being applied
	 * @returns The database optimized representation of the value.
	 */
	toDB(value: any, property: string, model: Model<any,any>): T;
}

export const DefaultTransforms = {
 	ObjectID: <PropertyTransform<MongoDB.ObjectID>>{
		fromDB: value => value instanceof MongoDB.ObjectID ? value.toHexString() : value,
		toDB: value => typeof value === "string" ? new MongoDB.ObjectID(value) : value
	},
	Binary: <PropertyTransform<MongoDB.Binary>>{
		fromDB: value => {
			if(!value) return null;
			if(value instanceof MongoDB.Binary) return (<any>value).buffer;
			
			return value;
		},
		toDB: value => {
			if(Buffer.isBuffer(value)) return new MongoDB.Binary(value);
			if(Array.isArray(value)) return new MongoDB.Binary(new Buffer(value));
			return null;
		}
	}
}