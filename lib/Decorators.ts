import * as MongoDB from "mongodb";
import * as _ from "lodash";
import * as Skmatc from "skmatc";
import {Instance} from "./Instance";
import {Model} from "./Model";
import {Index, IndexSpecification} from "./Index";
import {Schema} from "./Schema";
import {InstanceImplementation} from "./InstanceInterface";
import {Transforms, DefaultTransforms} from "./Transforms";
import * as MapReduceDef from './MapReduce';

/**
 * Specifies the name of the collection to which this instance's documents should be sent.
 * @param {string} name The name of the MongoDB collection to store the documents in.
 *
 * This decorator replaces the use of the static collection property on instance implementation
 * classes. If your transpiler does not support decorators then you are free to make use of the
 * property instead.
 */
export function Collection(name: string) {
	return function(target: InstanceImplementation<any, any>) {
		target.collection = name;
	};
}

/**
 * Specifies a MongoDB collection level index to be managed by Iridium for this instance type.
 * More than one instance of this decorator may be used if you wish to specify multiple indexes.
 * @param {IndexSpecification} spec The formal index specification which defines the properties and ordering used in the index.
 * @param {MongoDB.IndexOptions} options The options dictating the way in which the index behaves.
 *
 * This decorator replaces the use of the static indexes property on instance implementation
 * classes. If your transpiler does not support decorators then you are free to make use of the
 * property instead.
 */
export function Index(spec: IndexSpecification, options?: MongoDB.IndexOptions) {
	return function(target: InstanceImplementation<any,any>) {
		target.indexes = (target.indexes || []).concat(<Index>{ spec: spec, options: options || {} });
	}
}

/**
 * Specifies a custom validator to be made available for this collection's schema.
 * More than one instance of this decorator may be used if you wish to specify multiple validators.
 * @param {Object} forType The value in the schema which will be delegated to this function for validation.
 * @param {function} validate A function which calls this.assert(condition) to determine whether a schema node is valid or not.
 *
 * This decorator replaces the use of the static validators property on instance implementation
 * classes. If your transpiler does not support decorators then you are free to make use of the
 * property instead.
 * 
 * @example
 * @Iridium.Validate('everything', function(schema, data, path) {
 * 		return this.assert(data == 42, "Expected the answer to life, the universe and everything.");
 * })
 */
export function Validate(forType: any, validate: Skmatc.IValidationHandler) {
	return function(target: InstanceImplementation<any,any>) {
		target.validators = (target.validators || []).concat(Skmatc.create(schema => schema === forType, validate));
	}
}

/**
 * Specifies the schema type for the property this decorator is applied to. This can be used to replace the
 * static schema property on your instance. Multiple instances of this decorator can be applied, but no more
 * than one per property.
 *
 * @param {Object} asType The schema validation type to make use of for this property
 * @param {Boolean} [required] Whether this property is required to have a value or not, defaults to true.
 */
export function Property(asType: any, required?: boolean): (target: Instance<any, any>, name: string) => void;
/**
 * Specifies the schema type for a property with the given name on the class this decorator is applied to. This
 * can either compliment or replace the static schema property on your instance class.
 *
 * @param {String} name The name of the property that is being targetted
 * @param {Object} asType The schema validation type to make use of for this property
 * @param {Boolean} [required] Whether this property is required to have a value or not, defaults to true.
 */
export function Property(name: string, asType: any, required?: boolean): (target: InstanceImplementation<any, any>) => void;
export function Property(...args: any[]): (target: Instance<any, any> | InstanceImplementation<any, any>, name?: string) => void {
	let name: string|number|undefined = undefined,
		asType: any = false,
		required: boolean = true;

	if (args.length > 1 && typeof args[args.length - 1] === "boolean")
		required = args.pop();

	return function(target: InstanceImplementation<any, any>, property?: string) {
		let staticTarget: InstanceImplementation<any, any> = target;
		if (!property) name = args.shift();
		else {
			name = property;
			staticTarget = <InstanceImplementation<any, any>>target.constructor;
		}
		asType = args.pop() || false;

		staticTarget.schema = _.clone(staticTarget.schema || { _id: false });
		if(!required && typeof asType !== "boolean") staticTarget.schema[name!] = { $required: required, $type: asType };
		else staticTarget.schema[name!] = asType;
	}
}

/**
 * Specifies a custom transform to be applied to the property this decorator is applied to.
 *
 * @param {function} fromDB The function used to convert values from the database for the application.
 * @param {function} toDB The function used to convert values from the application to the form used in the database.
 *
 * Property transforms are lazily evaluated when their fields are accessed for performance reasons.
 * Modifying the values of an array or object will *not* trigger its transform function unless the
 * document level property is re-assigned.
 * 
 * This decorator can either compliment or replace the static transforms property on your instance
 * class, however only one transform can be applied to any property at a time.
 * If your transpiler does not support decorators then you are free to make use of the
 * property instead.
 * 
 * If this decorator is applied to the instance class itself, as opposed to a property, then
 * it will be treated as a $document transformer - and will receive the full document as opposed
 * to individual property values. Similarly, it is expected to return a full document when either
 * fromDB or toDB is called.
 */
export function Transform(fromDB: (value: any, property: string, model: Model<any,any>) => any, toDB: (value: any, property: string, model: Model<any,any>) => any) {
	return function(target: Instance<any, any>|InstanceImplementation<any, any>, property: string = "$document") {
		let staticTarget: InstanceImplementation<any, any> = <InstanceImplementation<any, any>>(target instanceof Instance && target.constructor || target);

		staticTarget.transforms = _.clone(staticTarget.transforms || <Transforms>{})
		staticTarget.transforms[property] = {
			fromDB: fromDB,
			toDB: toDB
		};
	};
}


/**
 * Specifies that this property should be treated as an ObjectID, with the requisite validator and transforms.
 *
 * This decorator applies an ObjectID validator to the property, which ensures that values sent to the database
 * are instances of the MongoDB ObjectID type, as well as applying a transform operation which converts ObjectIDs
 * to strings for your application, and then converts strings back to ObjectIDs for the database.
 */
export function ObjectID(target: Instance<any, any>, name: string) {
	Property(MongoDB.ObjectID)(target, name);
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
export function Binary(target: Instance<any, any>, name: string) {
	Property(Buffer)(target, name);
	Transform(
		DefaultTransforms.Binary.fromDB,
		DefaultTransforms.Binary.toDB
	)(target, name);
}

/**
 * Specifies that the instance is a result of a mapReduce operation and functions of that operation.
 * 
 * @param TDocument Interface of the document on which the operation will run
 * @param Key Type of the mapped keys
 * @param Value Type of the mapped values
 * 
 * @param {MapReduce.MapFunction<TDocument>} map A function which maps documents.
 * @param {MapReduce.ReduceFunction<Key, Value>} reduce A function which reduces mapped pairs.
 *
 * This decorator replaces the use of the static mapReduce property on instance implementation
 * classes. If your transpiler does not support decorators then you are free to make use of the
 * property instead.
 */
export function MapReduce<TDocument, Key, Value>(map: MapReduceDef.MapFunction<TDocument>,
	reduce: MapReduceDef.ReduceFunction<Key, Value>) {
	return function (target: InstanceImplementation<any, any>) {
		target.mapReduceOptions = { map: map, reduce: reduce };
	};
}