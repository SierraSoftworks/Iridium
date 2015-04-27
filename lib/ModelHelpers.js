var Skmatc = require('skmatc');
var Omnom = require('./utils/Omnom');
var ModelHelpers = (function () {
    function ModelHelpers(model) {
        this.model = model;
        this._validator = new Skmatc(model.schema);
    }
    /**
     * Validates a document to ensure that it matches the model's ISchema requirements
     * @param {any} document The document to validate against the ISchema
     * @returns {SkmatcCore.IResult} The result of the validation
     */
    ModelHelpers.prototype.validate = function (document) {
        return this._validator.validate(document);
    };
    /**
     * Wraps the given document in an instance wrapper for use throughout the application
     * @param {any} document The document to be wrapped as an instance
     * @param {Boolean} isNew Whether the instance originated from the database or was created by the application
     * @param {Boolean} isPartial Whether the document supplied contains all information present in the database
     * @returns {any} An instance which wraps this document
     */
    ModelHelpers.prototype.wrapDocument = function (document, isNew, isPartial) {
        return new this.model.Instance(document, isNew, isPartial);
    };
    /**
     * Performs a diff operation between two documents and creates a MongoDB changes object to represent the differences
     * @param {any} original The original document prior to changes being made
     * @param {any} modified The document after changes were made
     */
    ModelHelpers.prototype.diff = function (original, modified) {
        var omnom = new Omnom();
        omnom.diff(original, modified);
        return omnom.changes;
    };
    return ModelHelpers;
})();
module.exports = ModelHelpers;
//# sourceMappingURL=ModelHelpers.js.map