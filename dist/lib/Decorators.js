/// <reference path="../_references.d.ts" />
var MongoDB = require('mongodb');
var skmatc = require('skmatc');
function Collection(name) {
    return function (target) {
        target.collection = name;
    };
}
exports.Collection = Collection;
function Index(spec, options) {
    return function (target) {
        target.indexes = target.indexes || [];
        if (options)
            target.indexes.push({ spec: spec, options: options });
        else
            target.indexes.push({ spec: spec });
    };
}
exports.Index = Index;
function Validate(forType, validate) {
    return function (target) {
        target.validators = target.validators || [];
        target.validators.push(skmatc.create(function (schema) { return schema === forType; }, validate));
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
        asType = args.pop();
        target.schema = target.schema || {};
        if (!required)
            target.schema[name] = { $required: required, $type: asType };
        else
            target.schema[name] = asType;
    };
}
exports.Property = Property;
function ObjectID(target, name) {
    target.constructor.schema = target.constructor.schema || {};
    target.constructor.schema[name] = { $required: false, $type: /^[0-9a-f]{24}$/ };
    target.constructor.identifier = {
        apply: function (value) {
            return (value && value._bsontype == 'ObjectID') ? new MongoDB.ObjectID(value.id).toHexString() : value;
        },
        reverse: function (value) {
            if (value === null || value === undefined)
                return undefined;
            if (value && /^[a-f0-9]{24}$/.test(value))
                return MongoDB.ObjectID.createFromHexString(value);
            return value;
        }
    };
}
exports.ObjectID = ObjectID;

//# sourceMappingURL=../lib/Decorators.js.map