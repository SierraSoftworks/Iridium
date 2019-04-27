"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function MapReduce(map, reduce) {
    return function (target) {
        target.mapReduceOptions = { map: map, reduce: reduce };
    };
}
exports.MapReduce = MapReduce;
//# sourceMappingURL=MapReduce.js.map