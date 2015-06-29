/// <reference path="../_references.d.ts" />
var MongoDB = require('mongodb');
var _ = require('lodash');
var skmatc = require('skmatc');
function Collection(name) {
    return function (target) {
        target.collection = name;
    };
}
exports.Collection = Collection;
function Index(spec, options) {
    return function (target) {
        target.indexes = (target.indexes || []).concat({ spec: spec, options: options || {} });
    };
}
exports.Index = Index;
function Validate(forType, validate) {
    return function (target) {
        target.validators = (target.validators || []).concat(skmatc.create(function (schema) { return schema === forType; }, validate));
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
        if (!property)
            name = args.shift();
        else {
            name = property;
            target = target.constructor;
        }
        asType = args.pop() || false;
        target.schema = _.clone(target.schema || {});
        if (!required && typeof asType !== 'boolean')
            target.schema[name] = { $required: required, $type: asType };
        else
            target.schema[name] = asType;
    };
}
exports.Property = Property;
function Transform(fromDB, toDB) {
    return function (target, property) {
        target.constructor.transforms = _.clone(target.constructor.transforms || {});
        target.constructor.transforms[property] = {
            fromDB: fromDB,
            toDB: toDB
        };
    };
}
exports.Transform = Transform;
function ObjectID(target, name) {
    Property(MongoDB.ObjectID)(target, name);
    Transform(function (value) { return value && value._bsontype == 'ObjectID' ? new MongoDB.ObjectID(value.id).toHexString() : value; }, function (value) { return value && typeof value === 'string' ? new MongoDB.ObjectID(value) : value; })(target, name);
}
exports.ObjectID = ObjectID;

//# sourceMappingURL=../lib/Decorators.js.map