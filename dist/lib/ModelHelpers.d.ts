import { Model } from "./Model";
import * as Skmatc from "skmatc";
/**
 * A number of helper methods used commonly within Iridium, they provide a means to transform,
 * validate, wrap and diff instances and documents. By keeping these methods in one place we
 * help to improve testability and reduce code duplication (mouse abuse) throughout the codebase.
 * @internal
 */
export declare class ModelHelpers<TDocument extends {
    _id?: any;
}, TInstance> {
    model: Model<TDocument, TInstance>;
    constructor(model: Model<TDocument, TInstance>);
    private _validator;
    /**
     * Validates a document to ensure that it matches the model's ISchema requirements
     * @param {any} document The document to validate against the ISchema
     * @returns {SkmatcCore.IResult} The result of the validation
     */
    validate(document: TDocument): Skmatc.Result;
    /**
     * Wraps the given document in an instance wrapper for use throughout the application
     * @param {any} document The document to be wrapped as an instance
     * @param {Boolean} isNew Whether the instance originated from the database or was created by the application
     * @param {Boolean} isPartial Whether the document supplied contains all information present in the database
     * @returns {any} An instance which wraps this document
     */
    wrapDocument(document: TDocument, isNew?: boolean, isPartial?: boolean): TInstance;
    /**
     * Converts the given document to its database form into a form
     * using the transforms defined on the model.
     * @param {any} document The document to be converted
     * @returns {any} The result of having transformed the document.
     * @remarks This is only really called from insert/create - as
     */
    transformToDB<T>(document: T, options?: TransformOptions): T;
    /**
     * Converts the given document from its database form using the
     * transforms defined on the model.
     * @param document The document to be converted.
     * @returns The result of having transformed the document.
     * @remarks Unlike the transformToDB function - this method only applies
     * document level transforms, as property level transforms are applied in
     * their relevant instance setters.
     */
    transformFromDB(document: TDocument, options?: TransformOptions): TDocument;
    /**
     * Converts the given document to its database form into a form
     * using the transforms defined on the model.
     * @param document The document to be converted
     * @param processProperties Whether or not to process properties in addition
     * document level transforms.
     * @returns {any} A new document cloned from the original and transformed
     */
    convertToDB<T>(document: T, options?: TransformOptions): T;
    /**
     * Performs a diff operation between two documents and creates a MongoDB changes object to represent the differences
     * @param {any} original The original document prior to changes being made
     * @param {any} modified The document after changes were made
     */
    diff(original: TDocument, modified: TDocument): any;
    /**
     * Clones the given document recursively, taking into account complex types like
     * Buffers correctly.
     *
     * @param {any} The document you wish to clone deeply.
     */
    cloneDocument<T>(original: T): T;
    /**
     * Clones the given document recursively, taking into account complex types like
     * Buffers correctly. Optimized for working with query documents instead of true
     * documents.
     *
     * @param {any} The document you wish to clone deeply.
     */
    cloneConditions<T>(original: T): T;
}
export interface TransformOptions {
    properties?: boolean;
    document?: boolean;
}
