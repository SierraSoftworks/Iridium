/// <reference path="../_references.d.ts" />
import {Schema} from './Schema';
import {Model} from './Model';
import * as Index from './Index';
import {CacheDirector} from './CacheDirector';
import {Transforms} from './Transforms';

/**
 * This interface dictates the format of an instance class which wraps documents received
 * from the database for a specific Iridium model.
 * 
 * @param TDocument The interface representing the documents stored in the database, after being passed through the transforms pipeline.
 * @param TInstance The type of object which is instantiated when calling this implementation's constructor.
 * 
 * It is important to note that, when implementing this interface, each of the properties and methods
 * should be exposed statically. That is, you would expose the collection property as a static variable
 * on the instance implementation, since prototype methods and variables become available to consumers of the
 * instance itself.
 */
export interface InstanceImplementation<TDocument extends { _id ?: any }, TInstance> {
    /**
     * A constructor which creates a new instance tied to the given model and representing the given document.
     * @param model The Iridium Model which this instance should be tied to, gives the instance access to the database collection and any other context it requires.
     * @param doc The document this instance should wrap from the database. This provides the data context for the instance.
     * @param isNew Whether this document is known to exist in the database or not, for example, if the instance was generated from user input and hasn't been saved yet.
     * @param isPartial Whether the document which has been given to this instance had any field restrictions imposed on it during the query, and may therefore only contain partial data.
     */
    new (model: Model<TDocument, TInstance>, doc: TDocument, isNew?: boolean, isPartial?: boolean): TInstance;
    
    /**
     * The name of the database collection from which documents are retrieved, and to which they are stored.
     */
    collection: string;

    /**
     * The database schematic used for validation of instances prior to storing them in the database.
     * This schematic should follow the guides set out in skmatc's documentation, and is used whenever
     * you insert a new document into the collection or save an instance using the default instance type.
     * Operations like update() (and by extension, save() when using the update operations) cannot be checked
     * by skmatc for consistency and as a result will not have their data validated - be careful when making
     * use of them as a result.
     */
    schema: Schema;
    
    /**
     * Any additional indexes on the collection which should be managed by Iridium.
     * This field is optional, but if provided allows you to make use of the model's ensureIndexes() method
     * to automatically generate all specified indexes.
     */
    indexes?: (Index.Index | Index.IndexSpecification)[];
    
    /**
     * An optional method which will be called whenever a document is about to be inserted into the database,
     * allowing you to set default values and do any preprocessing you wish prior to the document being inserted.
     */
    onCreating? (document: TDocument): void;
    
    /**
     * An optional method which is called whenever a new document is received from the model's collection and
     * prior to the document being wrapped, can be used to perform preprocessing if necessary - however we recommend
     * you rather make use of transforms for that task.
     */
    onRetrieved? (document: TDocument): void;
    
    /**
     * An optional method which is called whenever a new document for this model has been wrapped in an instance.
     */
    onReady? (instance: TInstance): void;
    
    /**
     * An optional method which is called prior to saving an instance, it is provided with the instance itself as
     * well as the proposed changes to the instance. This allows you to make additional changes, such as updating
     * a lastChanged property on the document, or abort changes by throwing an error.
     */
    onSaving? (instance: TInstance, changes: any): void;

    /**
     * The cache controller used to determine whether a document may be cached, as well as deriving a unique cache
     * key for the document and similarly, for a query. This works in concert with the cache implementation itself
     * to ensure that documents are cached in an intelligent manner. By default this will simply make use of the
     * document's _id field as the cache key - however that behaviour may be modified if you wish to query on other
     * properties instead.
     */
    cache?: CacheDirector;
    
    /**
     * Any additional validation types you wish to make available for use within this model's database schema. This
     * allows you to validate using conditions otherwise not available within skmatc itself. For more information
     * on implementing a validator, take a look at the skmatc documentation on GitHub.
     */
    validators?: Skmatc.Validator[];
    
    /**
     * Any transform operations you would like to perform on documents received from the database, or prior to being
     * sent to the database. These may include things such as converting ObjectIDs to strings for the application, and
     * then back to ObjectIDs once they return to the database.
     */
    transforms?: Transforms;
}