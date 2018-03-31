import * as MongoDB from "mongodb";
import {Model} from "./Model";
import {InstanceInternals} from "./InstanceInterface";
import * as Skmatc from "skmatc";
import {Omnom} from "./utils/Omnom";
import * as _ from "lodash";

/**
 * A number of helper methods used commonly within Iridium, they provide a means to transform,
 * validate, wrap and diff instances and documents. By keeping these methods in one place we
 * help to improve testability and reduce code duplication (mouse abuse) throughout the codebase.
 * @internal
 */
export class ModelHelpers<TDocument, TInstance> {
    constructor(public model: Model<TDocument, TInstance>) {
        this._validator = Skmatc.scope(model.schema);
        model.validators.forEach(validator => this._validator.register(validator));
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
     * @returns {any} The result of having transformed the document.
     * @remarks This is only really called from insert/create - as 
     */
    transformToDB<T>(document: T, options: TransformOptions = { properties: true, renames: true }): T {
        if(options.document && this.model.transforms.$document)
            document = <any>this.model.transforms.$document.toDB(document, "$document", this.model);
        
        if(options.properties) {
            for (let property in this.model.transforms) {
                if (property === "$document") continue;

                const transform = this.model.transforms[property];
                if (!transform) continue;

                if(document.hasOwnProperty(property)) {
                    (<T & { [prop: string]: any }>document)[property]
                        = transform.toDB((<T & { [prop: string]: any }>document)[property], property, this.model);
                }
            }
        }

        if(options.renames) {
            for (let property in this.model.renames) {
                const dbField = this.model.renames[property];
                if ((<T & Object>document).hasOwnProperty(property)) {
                    (<T & { [prop: string]: any }>document)[dbField] = (<T & { [prop: string]: any }>document)[property]
                    delete (<T & { [prop: string]: any }>document)[property]
                }
            }
        }

        return document;
    }
    
    /**
     * Converts the given document from its database form using the
     * transforms defined on the model.
     * @param document The document to be converted.
     * @returns The result of having transformed the document.
     * @remarks Unlike the transformToDB function - this method only applies
     * document level transforms, as property level transforms are applied in
     * their relevant instance setters.
     */
    transformFromDB(document: TDocument, options: TransformOptions = { properties: true, renames: true }): TDocument {
        if(options.document && this.model.transforms.$document)
            document = this.model.transforms.$document.fromDB(document, "$document", this.model);

        if(options.renames) {
            for (let property in this.model.renames) {
                const dbField = this.model.renames[property];
                if ((<TDocument & Object>document).hasOwnProperty(dbField)) {
                    (<TDocument & { [prop: string]: any }>document)[property] = (<TDocument & { [prop: string]: any }>document)[dbField]
                    delete (<TDocument & { [prop: string]: any }>document)[dbField]
                }
            }
        }
        
        if(options.properties) {
            for (let property in this.model.transforms) {
                if(property === "$document") continue;

                const transform = this.model.transforms[property];
                if (!transform) continue;

                if(document.hasOwnProperty(property)) {
                    (<TDocument & { [prop: string]: any }>document)[property]
                        = transform.fromDB((<TDocument & { [prop: string]: any }>document)[property], property, this.model);
                }
            }
        }
            
        return document;
    }

    /**
     * Converts the given document to its database form into a form
     * using the transforms defined on the model.
     * @param document The document to be converted
     * @param processProperties Whether or not to process properties in addition
     * document level transforms.
     * @param clone Whether or not to clone the document before performing any transforms (performance boost)
     * @returns {any} A new document cloned from the original and transformed
     */
    convertToDB<T>(document: T, options: TransformOptions = { properties: true, renames: true }, clone: boolean = true): T {
        let doc: T = clone ? this.cloneDocument(document) : document;
        return this.transformToDB(doc, options);
    }

    /**
     * Performs a diff operation between two documents and creates a MongoDB changes object to represent the differences
     * @param {any} original The original document prior to changes being made
     * @param {any} modified The document after changes were made
     */
    diff(original: TDocument, modified: TDocument): any {
        let omnom = new Omnom();
        omnom.diff(original, modified);
        return omnom.changes;
    }
    
    /**
     * Clones the given document recursively, taking into account complex types like
     * Buffers correctly.
     * 
     * @param {any} The document you wish to clone deeply.
     */
    cloneDocument<T>(original: T): T {
        return _.cloneDeepWith<T>(original, (value) => {
           if(Buffer.isBuffer(value)) {
               return value;
           }
           
           if(value instanceof MongoDB.Binary) {
               return value;
           }
           
           if(value instanceof MongoDB.ObjectID) {
               return value;
           }
        });
    }
    
    /**
     * Clones the given document recursively, taking into account complex types like
     * Buffers correctly. Optimized for working with query documents instead of true
     * documents.
     * 
     * @param {any} The document you wish to clone deeply.
     */
    cloneConditions<T>(original: T): T {
        return this.cloneDocument(original);
    }

    readInstanceField<K extends keyof TInstance, V extends TInstance[K]>(instance: InstanceInternals<TDocument, TInstance>, field: K): V {
        if (instance._fieldCache.hasOwnProperty(field))
            return instance._fieldCache[field]

        const transform = instance._model.transforms[field]
        if (!transform) return (<any>instance._modified)[field]
        
        return instance._fieldCache[field] = transform.fromDB((<any>instance._modified)[field], field, instance._model)
    }

    writeInstanceField<K extends keyof TInstance, V extends TInstance[K]>(instance: InstanceInternals<TDocument, TInstance>, field: K, value: V): void {
        if (instance._fieldCache.hasOwnProperty(field)) {
            instance._fieldCache[field] = value
            return
        }

        (<any>instance._modified)[field] = value
    }

    applyCachedFieldChanges(instance: InstanceInternals<TDocument, TInstance>): TDocument {
        _.each(instance._fieldCache, (value, field: keyof TDocument) => {
            const transform = instance._model.transforms[field]
            if (transform)
                instance._modified[field] = transform.toDB(value, field, instance._model)
            else
                instance._modified[field] = value
        })

        instance._fieldCache = {}
        return instance._modified
    }
}

export interface TransformOptions {
    properties?: boolean;
    renames?: boolean;
    document?: boolean;
}