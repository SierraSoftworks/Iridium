/// <reference path="../_references.d.ts" />
import MongoDB = require('mongodb');
import Model from './Model';
import skmatc = require('skmatc');
import Omnom from './utils/Omnom';
import _ = require('lodash');
import Bluebird = require('bluebird');

export default class ModelHelpers<TDocument extends { _id?: any }, TInstance> {
    constructor(public model: Model<TDocument, TInstance>) {
        this._validator = new skmatc(model.schema);
    }

    private _validator: Skmatc.Skmatc;

    /**
     * Validates a document to ensure that it matches the model's ISchema requirements
     * @param {any} document The document to validate against the ISchema
     * @returns {SkmatcCore.IResult} The result of the validation
     */
    validate(document: TDocument): Skmatc.Result {
        return this._validator.validate(document);
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
     * Converts the given document to its database form into a form
     * using the transforms defined on the model.
     * @param {any} document The document to be converted
     * @returns {any} A new document cloned from the original and transformed
     */
    transformToDB<T>(document: T): T {
        for (var property in this.model.transforms)
            if(document.hasOwnProperty(property))
                document[property] = this.model.transforms[property].toDB(document[property]);
        return document;
    }
    
    /**
     * Converts the given document from its database form into a form for local consumption
     * using the transforms defined on the model.
     * @param {any} document The document to be converted
     * @returns {any} A new document cloned from the original and transformed
     */
    transformFromDB<T>(document: T): T {
        for (var property in this.model.transforms)
            if (document.hasOwnProperty(property))
                document[property] = this.model.transforms[property].fromDB(document[property]);
        return document;
    }
    
    /**
     * Converts the given document to its database form into a form
     * using the transforms defined on the model.
     * @param {any} document The document to be converted
     * @returns {any} A new document cloned from the original and transformed
     */
    convertToDB<T>(document: T): T {
        var doc: T = _.cloneDeep(document);
        return this.transformToDB(doc);
    }
    
    /**
     * Converts the given document from its database form into a form for local consumption
     * using the transforms defined on the model.
     * @param {any} document The document to be converted
     * @returns {any} A new document cloned from the original and transformed
     */
    convertFromDB<T>(document: T): T {
        var doc: T = _.cloneDeep(document);
        return this.transformFromDB(doc);
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
