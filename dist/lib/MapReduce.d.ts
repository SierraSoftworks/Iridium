import * as MongoDB from "mongodb";
declare global  {
    /**
     * Emits a key-value pair for mapping.
     * This is NOT a global function but is a MongoDB server internal function.
     * Only use in map function and nowhere else.
     *
     * @param {any} key Key to emit
     * @param {any} value Value to emit
     */
    function emit(key: any, value: any): void;
}
/**
 * A function to map values.
 * Values are mapped by calling a MongoDB server internal function `emit`.
 *
 * @param TDocument Interface of the document it works on.
 * @return {void} Nothing
 */
export interface MapFunction<TDocument> {
    (this: TDocument): void;
}
/**
 * A function to reduce mapped values.
 *
 * @param Key Type of the key
 * @param Value Type of the value
 *
 * @param {Key} key The key to reduce
 * @param {Value[]} values The values to reduce
 */
export interface ReduceFunction<Key, Value> {
    (key: Key, values: Value[]): Value | Value[] | any;
}
/**
 * Interface of the document returned as result of a mapReduce operation.
 *
 * @param Key Type of the key
 * @param Value Type of the value
 */
export interface MapReducedDocument<Key, Value> {
    _id: Key;
    value: Value;
}
/**
 * MapReduce Options.
 *
 * @param TDocument Interface of the document it works on.
 * @param Key Type of the key to reduce
 * @param Value Type of the values to reduce
 *
 * Extends `MongoDB.MapReduceOptions` with additional map and reduce field.
 */
export interface MapReduceFunctions<TDocument, Key, Value> {
    map: MapFunction<TDocument>;
    reduce: ReduceFunction<Key, Value>;
}
export interface MapReduceOptions extends MongoDB.MapReduceOptions {
    out?: "inline" | "replace" | "merge" | "reduce";
}
