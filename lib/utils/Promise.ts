import {Callback, Mapper} from "../General";

/**
 * Adds support for using callbacks with methods which commonly return promises.
 * @param promise The promise that is usually returned by the method.
 * @param callback The callback provided in lieu of using a promise.
 */
export function Nodeify<T>(promise: Promise<T>, callback?: Callback<T>): Promise<T> {
    if (typeof callback === "function") {
        promise.then(res => callback(null, res), err => callback(err));
    }

    return promise;
}

/**
 * A method which maps a promised list to another promised list using the provided mapping function.
 * @param list The promise that provides the list
 * @param map The method which is used to map an input entry to an output entry
 */
export function Map<T, S>(list: T[]|Promise<T[]>, map: Mapper<T, Promise<S>|S>): Promise<S[]> {
    if (Array.isArray(list)) return Promise.all(list.map(map));
    return list.then(results => Promise.all(results.map(map)));
}

/**
 * Returns a promise which will be resolved with `undefined` after given `ms`
 * milliseconds.
 * @param ms The amount of time, in milliseconds, to wait before resolving
 */
export function Delay(ms: number): Promise<void>;
/**
 * Returns a promise which will be resolved with `value` after given `ms`
 * milliseconds. If `value` is a promise, the delay will start counting down when it is
 * fulfilled with the fullfilment value of the `value` promise. If `value` is a rejected
 * promise, the resulting promise will be immediately rejected.
 * @param ms The amount of time, in milliseconds, to wait before resolving
 */
export function Delay<T>(ms: number, value: T): Promise<T>;
export function Delay(ms: number, value?: any): Promise<any> {
    return Promise.resolve(value).then(value => {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(value), ms);
        });
    });
}