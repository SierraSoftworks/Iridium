/**
 * Various interfaces for low level BSON types used within Iridium.
 */

/**
 * Represents a low level BSON value with its included _bsontype property.
 */
export interface Value {
	_bsontype: string;
}

/**
 * Represents a raw ObjectID object received from the database.
 */
export interface ObjectID extends Value {
	id: string;
}

/**
 * Represents a raw Binary object received from the database.
 */
export interface Binary extends Value {
	buffer: Buffer;
}