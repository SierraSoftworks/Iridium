"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Instance_1 = require("../Instance");
const lodash_1 = require("lodash");
/**
 * Specifies a custom transform to be applied to the property this decorator is applied to.
 *
 * @param {function} fromDB The function used to convert values from the database for the application.
 * @param {function} toDB The function used to convert values from the application to the form used in the database.
 *
 * Property transforms are lazily evaluated when their fields are accessed for performance reasons.
 * Modifying the values of an array or object will *not* trigger its transform function unless the
 * document level property is re-assigned.
 *
 * This decorator can either compliment or replace the static transforms property on your instance
 * class, however only one transform can be applied to any property at a time.
 * If your transpiler does not support decorators then you are free to make use of the
 * property instead.
 *
 * If this decorator is applied to the instance class itself, as opposed to a property, then
 * it will be treated as a $document transformer - and will receive the full document as opposed
 * to individual property values. Similarly, it is expected to return a full document when either
 * fromDB or toDB is called.
 */
function Transform(fromDB, toDB) {
    return function (target, property = "$document") {
        let staticTarget = (target instanceof Instance_1.Instance && target.constructor || target);
        staticTarget.transforms = lodash_1.clone(staticTarget.transforms || {});
        staticTarget.transforms[property] = {
            fromDB: fromDB,
            toDB: toDB
        };
    };
}
exports.Transform = Transform;
/**
 * Renames a code field to a new name when it is persisted in the database
 * @param {string} dbField the name of the field as it is stored in the DB
 */
function Rename(dbField) {
    return function (target, property) {
        let staticTarget = (target instanceof Instance_1.Instance && target.constructor || target);
        staticTarget.renames = lodash_1.clone(staticTarget.renames || {});
        staticTarget.renames[property] = dbField;
    };
}
exports.Rename = Rename;
/**
 * Provides an easy to use decorator which allows you to use a compatible class
 * as a transform type for this field.
 * @param transformType A class whose constructor accepts the DB object and which implements a toDB() method to convert back to a DB object
 */
function TransformClass(transformType) {
    return Transform((v, p, m) => new transformType(v, p, m), v => v.toDB());
}
exports.TransformClass = TransformClass;
/**
 * Provides an easy to use decorator which allows you to use a compatible class
 * as a transform type for this field.
 * @param transformType A class whose constructor accepts the DB object and which implements a toDB() method to convert back to a DB object
 */
function TransformClassList(transformType) {
    return Transform((vs, p, m) => vs.map((v) => new transformType(v, p, m)), vs => vs.map((v) => v.toDB()));
}
exports.TransformClassList = TransformClassList;
//# sourceMappingURL=Transforms.js.map