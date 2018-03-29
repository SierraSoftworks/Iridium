import * as Skmatc from "skmatc";
import {Schema} from "./Schema";
import {Model} from "./Model";
import * as Index from "./Index";
import {CacheDirector} from "./CacheDirector";
import {Transforms, RenameMap} from "./Transforms";
import {Changes} from "./Changes";
import {MapFunction, ReduceFunction, MapReduceFunctions} from "./MapReduce"

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
export interface InstanceImplementation<TDocument, TInstance> {
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
     * mapReduce Options
     */
    mapReduceOptions?: MapReduceFunctions<any, any, any>;

    /**
     * An optional method which will be called whenever a document is about to be inserted into the database,
     * allowing you to set default values and do any preprocessing you wish prior to the document being inserted.
     *
     * @param document The document which will be inserted into the database.
     *
     * This method is executed synchronously, however you can perform asynchronous operations by returning a
     * promise which resolves once your task has completed. Be aware that this method is executed for every
     * document inserted into the database. As a result, long running tasks will have a significant impact
     * on the performance of your inserts.
     */
    onCreating? (document: TDocument): Promise<any> | PromiseLike<any> | void;

    /**
     * An optional method which is called whenever a new document is received from the model's collection and
     * prior to the document being wrapped, can be used to perform preprocessing if necessary - however we recommend
     * you rather make use of transforms for that task.
     *
     * @param document The document that was retrieved from the database.
     *
     * This method is executed synchronously, however you can perform asynchronous operations by returning a
     * promise which resolves once your task has completed. Be aware that this method is executed for every
     * document retrieved from the database. As a result, long running tasks will have a significant impact
     * on the performance of your queries.
     */
    onRetrieved? (document: TDocument): Promise<any> | PromiseLike<any> | void;

    /**
     * An optional method which is called whenever a new document for this model has been wrapped in an instance.
     *
     * @param instance The instance which has been created.
     *
     * This method is executed synchronously, however you can perform asynchronous operations by returning a
     * promise which resolves once your task has completed. Be aware that this method is executed for every
     * document retrieved from the database. As a result, long running tasks will have a significant impact
     * on the performance of your queries.
     */
    onReady? (instance: TInstance): Promise<any> | PromiseLike<any> | void;

    /**
     * An optional method which is called prior to saving an instance, it is provided with the instance itself as
     * well as the proposed changes to the instance. This allows you to make additional changes, such as updating
     * a lastChanged property on the document, or abort changes by throwing an error.
     *
     * @param instance The instance to which the changes are being made
     * @param changes The MongoDB change object describing the changes being made to the document.
     *
     * This method is executed synchronously, however you can perform asynchronous operations by returning a
     * promise which resolves once your task has completed. Be aware that this method is executed for every
     * call to save. As a result, long running tasks will have a significant impact on how quickly your save
     * operations are dispatched.
     */
    onSaving? (instance: TInstance, changes: Changes): Promise<any> | PromiseLike<any> | void;

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

    /**
     * The map of code field names to DB field names which will be used by Iridium to rename
     * those fields should you wish to have differing field names within the DB to those represented
     * in your code.
     */
    renames?: RenameMap;
}

export interface InstanceInternals<TDocument extends { _id ?: any }, TInstance> {
    /**
     * The original document received from the database
     */
    _original: TDocument;

    /**
     * A copy of the original document which may have had changes applied to it
     */
    _modified: TDocument;

    /**
     * Whether this instance is known to be present in the database or not
     */
    _isNew: boolean;

    /**
     * Whether this instance represents a partial document
     */
    _isPartial: boolean;

    /**
     * The model that this instance belongs to
     */
    _model: Model<TDocument, TInstance>;

    /**
     * Used to provide post-transform object memoization on a per-field basis
     * See #118 for design details
     */
    _fieldCache: FieldCache

    /**
     * Allows an instance implementation to define its own means of accessing
     * properties. This is used to enable the memoization of transformed properties.
     * @param field The name of the schema field whose value should be returned
     */
    _getField<K extends keyof TInstance, V extends TInstance[K]>(field: K): V;

    /**
     * Allows an instance implementation to control how it responds when new values
     * are assigned to any of its fields. This is used to support memoization of
     * transformed properties safely.
     * @param field The name of the schema field whose value should be updated
     * @param value The pre-toDB-transform value to be assigned to this field
     */
    _setField<K extends keyof TInstance, V extends TInstance[K]>(field: K, value: V): void;
}

export interface FieldCache {
    [field: string]: any
}