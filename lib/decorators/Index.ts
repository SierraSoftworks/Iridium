import * as MongoDB from "mongodb";

import { IndexSpecification, Index } from "../Index";
import { InstanceImplementation } from "../InstanceInterface";

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