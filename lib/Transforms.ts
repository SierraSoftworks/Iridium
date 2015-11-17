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
			if(!value) return new Buffer(0);
			if(value._bsontype === "Binary") {
				let binary = new MongoDB.Binary(value);
				return binary.read(0, binary.length());
			}
			
			return new Buffer(0);
		},
		toDB: value => {
			if(!value) value = new Buffer(0);
			else if(Array.isArray(value)) value = new Buffer(value);
			
			if(value && Buffer.isBuffer(value)) return new MongoDB.Binary(value);
			return null;
		}
	}
}