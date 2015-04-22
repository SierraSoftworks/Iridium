var Skmatc = require('skmatc');
var StringCaseValidationPlugin = (function () {
    function StringCaseValidationPlugin() {
        this.validate = [
            Skmatc.create(function (schema) { return schema == "Lowercase"; }, function (schema, data, path) {
                return this.assert(data.toLowerCase() == data);
            }),
            Skmatc.create(function (schema) { return schema == "Uppercase"; }, function (schema, data, path) {
                return this.assert(data.toUpperCase() == data);
            })
        ];
    }
    return StringCaseValidationPlugin;
})();
module.exports = StringCaseValidationPlugin;
//# sourceMappingURL=ValidationPlugin.js.map