import { Instance } from "../Instance";
import { InstanceImplementation } from "../InstanceInterface";
import { Model } from "../Model";
import { Transforms } from "../Transforms";
import {clone} from "lodash";

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
export function Transform<
    TInstance extends Instance<any, TInstance>|InstanceImplementation<any, TInstance> = any,
    K extends keyof TInstance = any,
    V extends TInstance[K] = any
>(
    fromDB: (value: any, property: K, model: Model<any, TInstance>) => V,
    toDB: (value: V, property: string, model: Model<any, TInstance>) => any
) {
	return function(target: TInstance, property: K|"$document" = "$document") {
		let staticTarget: InstanceImplementation<any, any> = <InstanceImplementation<any, any>>(target instanceof Instance && target.constructor || target);

		staticTarget.transforms = clone(staticTarget.transforms || <Transforms>{})
		staticTarget.transforms[property] = {
			fromDB: fromDB,
			toDB: toDB
		};
	};
}

/**
 * Renames a code field to a new name when it is persisted in the database
 * @param {string} dbField the name of the field as it is stored in the DB
 */
export function Rename<
    TInstance extends Instance<any, TInstance>|InstanceImplementation<any, TInstance> = any,
    K extends keyof TInstance = any
>(dbField: string) {
	return function(target: TInstance, property: K) {
		let staticTarget: InstanceImplementation<any, TInstance> = <InstanceImplementation<any, TInstance>>(target instanceof Instance && target.constructor || target);
		staticTarget.renames = clone(staticTarget.renames || { });
		staticTarget.renames[property] = dbField
	}
}

/**
 * Interface used to describe a class whose responsibility is representing
 * a DB object. Its constructor receives the object, property name and model
 * and it is expected to implement a toDB() method which returns a DB element.
 */
export interface TransformClassType<V, T> {
    new(doc: T, property: string, model: Model<any, any>): V & TransformClassInstance<T>;
}

/**
 * Interface which describes an instance of a TransformClassType which is representing
 * a DB element. It implements the toDB() method which will convert the element into
 * a format which is compatible with the database storage schema.
 */
export interface TransformClassInstance<T> {
    toDB(): T;
}

/**
 * Provides an easy to use decorator which allows you to use a compatible class
 * as a transform type for this field.
 * @param transformType A class whose constructor accepts the DB object and which implements a toDB() method to convert back to a DB object
 */
export function TransformClass<
    TInstance extends Instance<any, TInstance> = any,
    K extends keyof TInstance = any,
    TField extends TInstance[K] & TransformClassInstance<TDocument> = any,
    TDocument = any,
>(
    transformType: TransformClassType<TField, TDocument>
) {
    return Transform<TInstance, K, TField>(
        (v, p, m) => new transformType(v, p, m),
        v => v.toDB()
    )
}

/**
 * Provides an easy to use decorator which allows you to use a compatible class
 * as a transform type for this field.
 * @param transformType A class whose constructor accepts the DB object and which implements a toDB() method to convert back to a DB object
 */
export function TransformClassList<
    TInstance extends Instance<any, TInstance>= any,
    K extends keyof TInstance= any,
    TField extends TInstance[K] & ArrayLike<TElement>= any,
    TElement extends TransformClassInstance<TDocument>= any,
    TDocument= any
>(
    transformType: TransformClassType<TElement, TDocument>
) {
    return Transform<TInstance, K, TField>(
        (vs, p, m) => vs.map((v: TDocument) => new transformType(v, p, m)),
        vs => vs.map((v: TElement) => v.toDB())
    )
}