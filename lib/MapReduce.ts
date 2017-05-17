import * as MongoDB from "mongodb"

import { Instance } from "./Instance"

declare global {
    /**
     * Emits a key-value pair for mapping.
     * 
     * @param {any} key Key to emit
     * @param {any} value Value to emit
     */
    function emit(key: any, value: any): void
}

/**
 * A function to map values.
 * 
 * @param TDocument Interface of the document it works on.
 */
export interface MapFunction<TDocument> {
    (this: TDocument): void
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
    (key: Key, values: Value[]): Value
}

/**
 * Interface of the document returned as result of a mapReduce operation.
 * 
 * @param Key Type of the key
 * @param Value Type of the value
 */
export interface MapReducedDocument<Key, Value> {
    _id: Key
    value: Value
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
    map: MapFunction<TDocument>
    reduce: ReduceFunction<Key, Value>
}