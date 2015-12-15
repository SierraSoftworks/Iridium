var MongoDB = require('mongodb');
var _ = require('lodash');
var Skmatc = require('skmatc');
var Transforms_1 = require('./Transforms');
/**
 * Specifies the name of the collection to which this instance's documents should be sent.
 * @param name The name of the MongoDB collection to store the documents in.
 *
 * This decorator replaces the use of the static collection property on instance implementation
 * classes. If your transpiler does not support decorators then you are free to make use of the
 * property instead.
 */
function Collection(name) {
    return function (target) {
        target.collection = name;
    };
}
exports.Collection = Collection;
/**
 * Specifies a MongoDB collection level index to be managed by Iridium for this instance type.
 * More than one instance of this decorator may be used if you wish to specify multiple indexes.
 * @param spec The formal index specification which defines the properties and ordering used in the index.
 * @param options The options dictating the way in which the index behaves.
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
/**
 * Specifies a custom validator to be made available for this collection's schema.
 * More than one instance of this decorator may be used if you wish to specify multiple validators.
 * @param forType The value in the schema which will be delegated to this function for validation.
 * @param validate A function which calls this.assert(condition) to determine whether a schema node is valid or not.
 *
 * This decorator replaces the use of the static validators property on instance implementation
 * classes. If your transpiler does not support decorators then you are free to make use of the
 * property instead.
 */
function Validate(forType, validate) {
    return function (target) {
        target.validators = (target.validators || []).concat(Skmatc.create(function (schema) { return schema === forType; }, validate));
    };
}
exports.Validate = Validate;
function Property() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var name = null, asType = false, required = true;
    if (args.length > 1 && typeof args[args.length - 1] === 'boolean')
        required = args.pop();
    return function (target, property) {
        var staticTarget = target;
        if (!property)
            name = args.shift();
        else {
            name = property;
            staticTarget = target.constructor;
        }
        asType = args.pop() || false;
        staticTarget.schema = _.clone(staticTarget.schema || { _id: false });
        if (!required && typeof asType !== 'boolean')
            staticTarget.schema[name] = { $required: required, $type: asType };
        else
            staticTarget.schema[name] = asType;
    };
}
exports.Property = Property;
/**
 * Specifies a custom transform to be applied to the property this decorator is applied to.
 *
 * @param fromDB The function used to convert values from the database for the application.
 * @param toDB The function used to convert values from the application to the form used in the database.
 *
 * This decorator can either compliment or replace the static transforms property on your instance
 * class, however only one transform can be applied to any property at a time.
 * If your transpiler does not support decorators then you are free to make use of the
 * property instead.
 */
function Transform(fromDB, toDB) {
    return function (target, property) {
        if (property === void 0) { property = '$document'; }
        var staticTarget = (target.constructor || target);
        staticTarget.transforms = _.clone(staticTarget.transforms || {});
        staticTarget.transforms[property] = {
            fromDB: fromDB,
            toDB: toDB
        };
    };
}
exports.Transform = Transform;
/**
 * Specifies that this property should be treated as an ObjectID, with the requisite validator and transforms.
 *
 * This decorator applies an ObjectID validator to the property, which ensures that values sent to the database
 * are instances of the MongoDB ObjectID type, as well as applying a transform operation which converts ObjectIDs
 * to strings for your application, and then converts strings back to ObjectIDs for the database.
 */
function ObjectID(target, name) {
    Property(MongoDB.ObjectID)(target, name);
    Transform(Transforms_1.DefaultTransforms.ObjectID.fromDB, Transforms_1.DefaultTransforms.ObjectID.toDB)(target, name);
}
exports.ObjectID = ObjectID;
/**
 * Specifies that this property should be stored using the MongoDB binary type and represented as a Buffer.
 *
 * This decorator applies a Buffer validator to the property, which ensures that values you send to the database
 * are well formatted Buffer objects represented using the BSON Binary datatype. In addition to this, it will
 * apply a transform which ensures you only work with Buffer objects and that data is always stored in Binary
 * format.
 */
function Binary(target, name) {
    Property(Buffer)(target, name);
    Transform(Transforms_1.DefaultTransforms.Binary.fromDB, Transforms_1.DefaultTransforms.Binary.toDB)(target, name);
}
exports.Binary = Binary;

//# sourceMappingURL=Decorators.js.map
