var Skmatc = require('skmatc');
var Omnom_1 = require('./utils/Omnom');
var _ = require('lodash');
/**
 * A number of helper methods used commonly within Iridium, they provide a means to transform,
 * validate, wrap and diff instances and documents. By keeping these methods in one place we
 * help to improve testability and reduce code duplication (mouse abuse) throughout the codebase.
 * @internal
 */
var ModelHelpers = (function () {
    function ModelHelpers(model) {
        var _this = this;
        this.model = model;
        this._validator = Skmatc.scope(model.schema);
        model.validators.forEach(function (validator) { return _this._validator.register(validator); });
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
     * Converts the given document to its database form into a form
     * using the transforms defined on the model.
     * @param {any} document The document to be converted
     * @returns {any} A new document cloned from the original and transformed
     */
    ModelHelpers.prototype.transformToDB = function (document) {
        for (var property in this.model.transforms)
            if (document.hasOwnProperty(property))
                document[property] = this.model.transforms[property].toDB(document[property]);
        return document;
    };
    /**
     * Converts the given document to its database form into a form
     * using the transforms defined on the model.
     * @param {any} document The document to be converted
     * @returns {any} A new document cloned from the original and transformed
     */
    ModelHelpers.prototype.convertToDB = function (document) {
        var doc = _.cloneDeep(document);
        return this.transformToDB(doc);
    };
    /**
     * Performs a diff operation between two documents and creates a MongoDB changes object to represent the differences
     * @param {any} original The original document prior to changes being made
     * @param {any} modified The document after changes were made
     */
    ModelHelpers.prototype.diff = function (original, modified) {
        var omnom = new Omnom_1.Omnom();
        omnom.diff(original, modified);
        return omnom.changes;
    };
    return ModelHelpers;
})();
exports.ModelHelpers = ModelHelpers;

//# sourceMappingURL=ModelHelpers.js.map
