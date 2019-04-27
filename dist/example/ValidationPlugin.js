"use strict";
const Skmatc = require("skmatc");
class StringCaseValidationPlugin {
    constructor() {
        this.validate = [
            Skmatc.create((schema) => schema === "Lowercase", function (schema, data, path) { return this.assert(data.toLowerCase() == data); }),
            Skmatc.create((schema) => schema === "Uppercase", function (schema, data, path) { return this.assert(data.toUpperCase() == data); })
        ];
    }
}
module.exports = StringCaseValidationPlugin;
//# sourceMappingURL=ValidationPlugin.js.map