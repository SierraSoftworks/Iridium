"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
function Property(...args) {
    let name = undefined, asType = false, required = true;
    if (args.length > 1 && typeof args[args.length - 1] === "boolean")
        required = args.pop();
    return function (target, property) {
        let staticTarget = target;
        if (!property)
            name = args.shift();
        else {
            name = property;
            staticTarget = target.constructor;
        }
        asType = args.pop() || false;
        staticTarget.schema = lodash_1.clone(staticTarget.schema || { _id: false });
        if (!required && typeof asType !== "boolean")
            staticTarget.schema[name] = { $required: required, $type: asType };
        else
            staticTarget.schema[name] = asType;
    };
}
exports.Property = Property;
//# sourceMappingURL=Schema.js.map