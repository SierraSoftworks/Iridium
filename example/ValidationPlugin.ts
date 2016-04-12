import Iridium = require("../iridium");
import Skmatc = require("skmatc");

export = StringCaseValidationPlugin;

class StringCaseValidationPlugin implements Iridium.Plugin {
    validate = [
        Skmatc.create((schema) => schema === "Lowercase", function (schema, data, path) { return this.assert(data.toLowerCase() == data) }),
        Skmatc.create((schema) => schema === "Uppercase", function (schema, data, path) { return this.assert(data.toUpperCase() == data) })
    ];
}
