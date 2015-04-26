/// <reference path="../_references.d.ts" />
import MongoDB = require('mongodb');
import Model = require('./Model');
import Concoction = require('concoction');
import Skmatc = require('skmatc');
import Omnom = require('./utils/Omnom');
import _ = require('lodash');
import Bluebird = require('bluebird');

export = ModelHelpers;

class ModelHelpers<TDocument extends { _id?: any }, TInstance> {
    constructor(public model: Model<TDocument, TInstance>) {
        this._validator = new Skmatc(model.schema);
    }

    private _validator: Skmatc;

    /**
     * Validates a document to ensure that it matches the model's ISchema requirements
     * @param {any} document The document to validate against the ISchema
     * @returns {SkmatcCore.IResult} The result of the validation
     */
    validate(document: TDocument): SkmatcCore.IResult {
        return this._validator.validate(document);
    }
    
    /**
     * Creates a selector based on the document's unique _id field in downstream format
     * @param {any} id The downstream identifier to use when creating the selector
     * @returns {object} A database selector which can be used to return only this document in downstream form
     */
    selectOneDownstream(document: TDocument): any {
        return _.isPlainObject(document) ? document._id : {
            _id: document
        };
    }

    /**
     * Wraps the given document in an instance wrapper for use throughout the application
     * @param {any} document The document to be wrapped as an instance
     * @param {Boolean} isNew Whether the instance originated from the database or was created by the application
     * @param {Boolean} isPartial Whether the document supplied contains all information present in the database
     * @returns {any} An instance which wraps this document
     */
    wrapDocument(document: TDocument, isNew?: boolean, isPartial?: boolean): TInstance {
        return new this.model.Instance(document, isNew, isPartial);
    }

    /**
     * Performs a diff operation between two documents and creates a MongoDB changes object to represent the differences
     * @param {any} original The original document prior to changes being made
     * @param {any} modified The document after changes were made
     */
    diff(original: TDocument, modified: TDocument): any {
        var omnom = new Omnom();
        omnom.diff(original, modified);
        return omnom.changes;
    }
}
