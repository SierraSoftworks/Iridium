/// <reference path="../_references.d.ts" />
var MongoDB = require('mongodb');
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
function Identifier(fromDB, toDB) {
    return function (target) {
        target.identifier = {
            apply: fromDB,
            reverse: toDB
        };
    };
}
exports.Identifier = Identifier;
function GetDescriptor(target, name) {
    return Object.getOwnPropertyDescriptor(target, name) || {
        configurable: true,
        enumerable: true
    };
}
function Property(target, name, descriptor) {
    var desc = descriptor || GetDescriptor(target, name);
    desc.get = function () { return this.document[name]; };
    desc.set = function (value) { this.document[name] = value; };
    if (descriptor)
        return desc;
    Object.defineProperty(target, name, desc);
}
exports.Property = Property;
function ObjectID(target, name, descriptor) {
    var desc = descriptor || GetDescriptor(target, name);
    desc = Transform(function (value) {
        return (value && value._bsontype == 'ObjectID') ? new MongoDB.ObjectID(value.id).toHexString() : value;
    }, function (value) {
        if (value === null || value === undefined)
            return undefined;
        if (value && /^[a-f0-9]{24}$/.test(value))
            return MongoDB.ObjectID.createFromHexString(value);
        return value;
    });
    if (descriptor)
        return desc;
    Object.defineProperty(target, name, desc);
}
exports.ObjectID = ObjectID;
function Transform(fromDB, toDB) {
    return function (target, name, descriptor) {
        var desc = descriptor || GetDescriptor(target, name);
        var get = desc.get || function () { return this.document[name]; }, set = desc.set || function (value) { this.document[name] = value; };
        desc.get = function () {
            return fromDB(get.call(this));
        };
        desc.set = function (value) {
            return set.call(this, toDB(value));
        };
        if (descriptor)
            return desc;
        Object.defineProperty(target, name, desc);
    };
}
exports.Transform = Transform;

//# sourceMappingURL=../lib/Decorators.js.map