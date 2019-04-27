"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Adds support for using callbacks with methods which commonly return promises.
 * @param promise The promise that is usually returned by the method.
 * @param callback The callback provided in lieu of using a promise.
 */
function Nodeify(promise, callback) {
    if (typeof callback === "function") {
        promise.then(res => callback(null, res), err => callback(err));
    }
    return promise;
}
exports.Nodeify = Nodeify;
/**
 * A method which maps a promised list to another promised list using the provided mapping function.
 * @param list The promise that provides the list
 * @param map The method which is used to map an input entry to an output entry
 */
function Map(list, map) {
    if (Array.isArray(list))
        return Promise.all(list.map(map));
    return list.then(results => Promise.all(results.map(map)));
}
exports.Map = Map;
function Delay(ms, value) {
    return Promise.resolve(value).then(value => {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(value), ms);
        });
    });
}
exports.Delay = Delay;
//# sourceMappingURL=Promise.js.map