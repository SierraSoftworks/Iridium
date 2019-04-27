import { Instance } from "../Instance";
import { InstanceImplementation } from "../InstanceInterface";
/**
 * Specifies the schema type for the property this decorator is applied to. This can be used to replace the
 * static schema property on your instance. Multiple instances of this decorator can be applied, but no more
 * than one per property.
 *
 * @param {Object} asType The schema validation type to make use of for this property
 * @param {Boolean} [required] Whether this property is required to have a value or not, defaults to true.
 */
export declare function Property<TInstance extends Instance<any, TInstance> = any, K extends keyof TInstance = any>(asType: any, required?: boolean): (target: TInstance, name: K) => void;
/**
 * Specifies the schema type for a property with the given name on the class this decorator is applied to. This
 * can either compliment or replace the static schema property on your instance class.
 *
 * @param {String} name The name of the property that is being targetted
 * @param {Object} asType The schema validation type to make use of for this property
 * @param {Boolean} [required] Whether this property is required to have a value or not, defaults to true.
 */
export declare function Property<TInstance extends InstanceImplementation<any, TInstance> = any, K extends keyof TInstance = any>(name: K, asType: any, required?: boolean): (target: TInstance) => void;
