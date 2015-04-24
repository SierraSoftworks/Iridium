var Concoction = require('concoction');
var Skmatc = require('skmatc');
var Omnom = require('./utils/Omnom');
var _ = require('lodash');
var ModelHelpers = (function () {
    function ModelHelpers(model) {
        this.model = model;
        this._validator = new Skmatc(model.schema);
        this.transform = new Concoction(model.options.transforms);
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
     * Creates a selector based on the document's unique _id field
     * @param {object} document The document to render the unique selector for
     * @returns {{_id: any}} A database selector which can be used to return only this document
     */
    ModelHelpers.prototype.selectOne = function (document) {
        var testDoc = _.cloneDeep(document);
        this.transform.reverse(testDoc);
        return {
            _id: testDoc._id
        };
    };
    Object.defineProperty(ModelHelpers.prototype, "identifierField", {
        /**
         * Gets the field used in the ISchema to represent the document _id
         */
        get: function () {
            var id = {};
            var testDoc = {
                _id: id
            };
            this.transform.apply(testDoc);
            var idField = null;
            for (var k in testDoc)
                if (testDoc[k] === id) {
                    idField = k;
                    break;
                }
            return idField;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates a selector based on the document's unique _id field in downstream format
     * @param {any} id The downstream identifier to use when creating the selector
     * @returns {object} A database selector which can be used to return only this document in downstream form
     */
    ModelHelpers.prototype.selectOneDownstream = function (id) {
        if (_.isPlainObject(id))
            return _.pick(id, this.identifierField);
        else {
            var conditions = {};
            conditions[this.identifierField] = id;
            return conditions;
        }
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