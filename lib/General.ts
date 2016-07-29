/**
 * A method which is called once an asynchronous operation has completed, an alternative
 * to using Promises.
 * @param T The type of object returned by the asynchronous operation.
 */
export interface Callback<T> {
    /**
     * @param err The error object, if one occurred, otherwise null if the operation completed successfully.
     * @param object The result of the asynchronous operation if it completed successfully. If err is defined, the presence of this value is unknown.
     */
    (err: Error, object?: T): void;
}

/**
 * A method which is used to determine whether a value within a collection meets a set of criteria.
 * @param T The type of item in the collection.
 */
export interface Predicate<TThis,TObject> {
    /**
     * @param object The value of the item in the collection
     * @param key The key, if one is available, under which the item appeared within the collection
     * @returns A true-y value if the item met the predicate conditions, false-y values if it did not.
     */
    (this: TThis, object: TObject, key?: string): boolean;
}

/**
 * A method which is called to retrieve a value of the given type.
 * @param T The type of value to be retrieved.
 */
export interface PropertyGetter<T> {
    /**
     * Gets the current value of the property
     * @returns The current value
     */
    (): T;
}

/**
 * A method which is called to set a value of the given type.
 * @param T The type of value to set
 */
export interface PropertySetter<T> {
    /**
     * Sets the value to the provided one
     * @param value The new value to set
     */
    (value: T): void;
}

/**
 * A compound property which provides either a getter, setter or both.
 * @param T The type of objects stored in the property
 */
export interface Property<T> {
    /**
     * An optional getter which can be used to retrieve the property's value
     */
    get?: PropertyGetter<T>;
    /**
     * An optional setter which can be used to set the property's value
     */
    set?: PropertySetter<T>;
}