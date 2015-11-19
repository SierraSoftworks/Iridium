import MongoDB = require('mongodb');

export interface Transforms {
	[property:string]: PropertyTransform;
}

/**
 * Converts the value of a property to and from its database representation.
 */
export interface PropertyTransform {
	/**
	 * Converts a property's value from its database representation into one
	 * suitable for the application.
	 * @param value The value stored in the MongoDB database document.
	 * @returns A derived value which is more useful to the application.
	 */
	fromDB(value: any): any;

	/**
	 * Converts a property's value into a representation more suitable for
	 * the database.
	 * @param value The value used by the application.
	 * @returns The database optimized representation of the value.
	 */
	toDB(value: any): any;
}

export const DefaultTransforms = {
 	ObjectID: <PropertyTransform>{
		fromDB: value => value && value._bsontype == 'ObjectID' ? new MongoDB.ObjectID(value.id).toHexString() : value,
		toDB: value => value && typeof value === 'string' ? new MongoDB.ObjectID(value) : value
	},
	Binary: <PropertyTransform>{
		fromDB: value => {
			if(!value) return null;
			if(value._bsontype === "Binary")
				return value.buffer;
			
			return value;
		},
		toDB: value => {
			if(Buffer.isBuffer(value)) return new MongoDB.Binary(value);
			if(Array.isArray(value)) return new MongoDB.Binary(new Buffer(value));
			return null;
		}
	}
}