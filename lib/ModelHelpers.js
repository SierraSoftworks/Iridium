var Skmatc = require('skmatc');
var Omnom = require('./utils/Omnom');
var ModelHelpers = (function () {
    function ModelHelpers(model) {
        this.model = model;
        this._validator = new Skmatc(model.schema);
    }
    ModelHelpers.prototype.validate = function (document) {
        return this._validator.validate(document);
    };
    ModelHelpers.prototype.wrapDocument = function (document, isNew, isPartial) {
        return new this.model.Instance(document, isNew, isPartial);
    };
    ModelHelpers.prototype.diff = function (original, modified) {
        var omnom = new Omnom();
        omnom.diff(original, modified);
        return omnom.changes;
    };
    return ModelHelpers;
})();
module.exports = ModelHelpers;
//# sourceMappingURL=ModelHelpers.js.map