import { InstanceImplementation } from "../InstanceInterface";
import {MapFunction, ReduceFunction}  from "../MapReduce";

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
export function MapReduce<
    Key = any,
    Value = any,
    TInstance extends InstanceImplementation<TDocument, TInstance> = any,
    TDocument = any,
>(map: MapFunction<TDocument>, reduce: ReduceFunction<Key, Value>) {
	return function (target: TInstance) {
		target.mapReduceOptions = { map: map, reduce: reduce };
	};
}