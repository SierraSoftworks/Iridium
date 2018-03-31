import { Instance } from "../Instance";
import { InstanceImplementation } from "../InstanceInterface";
import {clone} from "lodash";

/**
 * Specifies the schema type for the property this decorator is applied to. This can be used to replace the
 * static schema property on your instance. Multiple instances of this decorator can be applied, but no more
 * than one per property.
 *
 * @param {Object} asType The schema validation type to make use of for this property
 * @param {Boolean} [required] Whether this property is required to have a value or not, defaults to true.
 */
export function Property<
    TInstance extends Instance<any, TInstance> = any,
    K extends keyof TInstance = any
>(asType: any, required?: boolean): (target: TInstance, name: K) => void;
/**
 * Specifies the schema type for a property with the given name on the class this decorator is applied to. This
 * can either compliment or replace the static schema property on your instance class.
 *
 * @param {String} name The name of the property that is being targetted
 * @param {Object} asType The schema validation type to make use of for this property
 * @param {Boolean} [required] Whether this property is required to have a value or not, defaults to true.
 */
export function Property<
    TInstance extends InstanceImplementation<any, TInstance> = any,
    K extends keyof TInstance = any
>(name: K, asType: any, required?: boolean): (target: TInstance) => void;

export function Property<
    TInstance extends Instance<any, any> | InstanceImplementation<any, any>,
    K extends keyof TInstance
>(...args: any[]): (target: TInstance, name?: K) => void {
	let name: string|number|undefined = undefined,
		asType: any = false,
		required: boolean = true;

	if (args.length > 1 && typeof args[args.length - 1] === "boolean")
		required = args.pop();

	return function(target: TInstance, property?: K) {
		let staticTarget: InstanceImplementation<any, any> = <any>target;
		if (!property) name = args.shift();
		else {
			name = property;
			staticTarget = <InstanceImplementation<any, any>>target.constructor;
		}
		asType = args.pop() || false;

		staticTarget.schema = clone(staticTarget.schema || { _id: false });
		if(!required && typeof asType !== "boolean") staticTarget.schema[name!] = { $required: required, $type: asType };
		else staticTarget.schema[name!] = asType;
	}
}