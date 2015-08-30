/// <reference path="../_references.d.ts" />
/**
 * The interface to which a prepared instance constructor should conform. When called with a document
 * object, it should instantiate a new instance of type TInstance which is associated with its parent
 * model.
 * 
 * This is primarily used internally for prepared model instance constructors.
 * 
 * @param TDocument The interface used to describe the structure of the documents found in the database collection.
 * @param TInstance The interface or class used to wrap the documents returned from the database.
 * 
 * @internal
 */
export interface ModelSpecificInstanceConstructor<TDocument extends { _id?: any }, TInstance> {
    new (doc: TDocument, isNew?: boolean, isPartial?: boolean): TInstance;
}