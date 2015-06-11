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
function Validate(type) {
    return function (target, name, descriptor) {
        descriptor.validateType = type;
        return descriptor;
    };
}
exports.Validate = Validate;

//# sourceMappingURL=../lib/Decorators.js.map