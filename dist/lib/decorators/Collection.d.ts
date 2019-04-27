import { InstanceImplementation } from "../InstanceInterface";
/**
 * Specifies the name of the collection to which this instance's documents should be sent.
 * @param {string} name The name of the MongoDB collection to store the documents in.
 *
 * This decorator replaces the use of the static collection property on instance implementation
 * classes. If your transpiler does not support decorators then you are free to make use of the
 * property instead.
 */
export declare function Collection(name: string): (target: InstanceImplementation<any, any>) => void;
