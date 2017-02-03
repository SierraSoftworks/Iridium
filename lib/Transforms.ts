import {ObjectID, Binary} from "./BSON";
import {Model} from "./Model";
import {InstanceImplementation} from "./InstanceInterface";

export interface Transforms {
	/**
	 * A transform which is applied to the entire document.
	 */
	$document?: PropertyTransform<any>;
	_id?: PropertyTransform<any>;
	[property:string]: PropertyTransform<any>|undefined;
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
 	ObjectID: <PropertyTransform<ObjectID>>{
		fromDB: value => value instanceof ObjectID ? value.toHexString() : value,
		toDB: value => typeof value === "string" ? new ObjectID(value) : value
	},
	Binary: <PropertyTransform<Binary>>{
		fromDB: value => {
			if(!value) return null;
			if(value instanceof Binary) return (<any>value).buffer;
			
			return value;
		},
		toDB: value => {
			if(Buffer.isBuffer(value)) return new Binary(value);
			if(Array.isArray(value)) return new Binary(new Buffer(value));
			return null;
		}
	},
	DBRef: (model: InstanceImplementation<any, any>, db?: string) => <PropertyTransform<DBRef>>{
		fromDB: (value: DBRef, p: string, m: Model<any,any>): any => {
			return (model.transforms && model.transforms["_id"]) ? model.transforms["_id"]!.fromDB(value.$id, "_id", m) : value.$id
		},
		toDB: (value: any, p: string, m: Model<any,any>): DBRef => {
			return {
				$ref: model.collection,
				$id: (model.transforms && model.transforms["_id"]) ? model.transforms["_id"]!.toDB(value, "_id", m) : value,
				$db: db
			};
		}
	}
}

interface DBRef {
	$ref: string;
	$id: any;
	$db?: string;
}