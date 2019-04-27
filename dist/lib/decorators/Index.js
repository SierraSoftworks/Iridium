"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function Index(spec, options) {
    return function (target) {
        target.indexes = (target.indexes || []).concat({ spec: spec, options: options || {} });
    };
}
exports.Index = Index;
//# sourceMappingURL=Index.js.map