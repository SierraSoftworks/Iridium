import {Model} from "./Model";
import * as General from "./General";
import * as MongoDB from "mongodb";
import * as Index from "./Index";
import {Nodeify} from "./utils/Promise";

/**
 * An Iridium collection cursor which allows the itteration through documents
 * in the collection, automatically wrapping them in the correct instance type.
 *
 * @param TDocument The interface representing the collection's documents
 * @param TInstance The interface or class used to represent the wrapped documents.
 */
export class Cursor<TDocument extends { _id?: any }, TInstance> {
    /**
     * Creates a new Iridium cursor which wraps a MongoDB cursor object
     * @param {Model} model The Iridium model that this cursor belongs to
     * @param {Object} conditions The conditions that resulte in this cursor being created
     * @param {MongoDB.Cursor} cursor The MongoDB native cursor object to be wrapped
     * @constructor
     */
    constructor(private model: Model<TDocument, TInstance>, private conditions: any, public cursor: MongoDB.Cursor<TDocument>) {

    }

    /**
     * Counts the number of documents which are matched by this cursor
     * @param {function} [callback] A callback which is triggered when the result is available
     * @return {Promise} A promise which will resolve with the number of documents matched by this cursor
     */
    count(callback?: General.Callback<number>): Promise<number> {
        return Nodeify(new Promise<number>((resolve, reject) => {
            this.cursor.count(true, (err, count) => {
                if (err) return reject(err);
                return resolve(count);
            });
        }), callback);
    }

    /**
     * Runs the specified handler over each instance in the query results
     * @param {function} handler The handler which is triggered for each element in the query
     * @param {function} [callback] A callback which is triggered when all operations have been dispatched
     * @return {Promise} A promise which is resolved when all operations have been dispatched
     */
    forEach(handler: (instance: TInstance) => void, callback?: General.Callback<void>): Promise<void> {
        let helpers = this.model.helpers;
        return Nodeify(new Promise<void>((resolve, reject) => {
            this.cursor.forEach((item: TDocument) => {
                this.model.handlers.documentReceived(this.conditions, item, function () { return helpers.wrapDocument.apply(helpers, arguments); }).then(handler);
            }, (err) => {
                if (err) return reject(err);
                return resolve(undefined);
            });
        }), callback);
    }

    /**
     * Runs the specified transform over each instance in the query results and returns the resulting transformed objects
     * @param {function} transform A handler which is used to transform the result objects
     * @param {function} [callback] A callback which is triggered when the transformations are completed
     * @return {Promise} A promise which is fulfilled with the results of the transformations
     */
    map<TResult>(transform: (instance: TInstance) => TResult | Promise<TResult>, callback?: General.Callback<TResult[]>): Promise<TResult[]> {
        let helpers = this.model.helpers;
        return Nodeify(new Promise<TResult[]>((resolve, reject) => {
            let promises: Promise<TResult>[] = [];
            this.cursor.forEach((item: TDocument) => {
                promises.push(this.model.handlers.documentReceived(this.conditions, item, function () { return helpers.wrapDocument.apply(helpers, arguments); })
                    .then(<(instance: TInstance) => TResult>transform));
            }, (err) => {
                if (err) return reject(err);
                return resolve(Promise.all(promises));
            });
        }), callback);
    }

    /**
     * Retrieves all matching instances and returns them in an array
     * @param {function} [callback] A callback which is triggered with the resulting instances
     * @return {Promise} A promise which resolves with the instances returned by the query
     */
    toArray(callback?: General.Callback<TInstance[]>): Promise<TInstance[]> {
        let helpers = this.model.helpers;
        return Nodeify(new Promise<TDocument[]>((resolve, reject) => {
            this.cursor.toArray((err: Error, results: TDocument[]) => {
                if (err) return reject(err);
                return resolve(results);
            });
        }).then(docs => Promise.all(docs.map((document) => {
            return this.model.handlers.documentReceived(this.conditions, document, function () { return helpers.wrapDocument.apply(helpers, arguments); });
        }))), callback);
    }

    /**
     * Retrieves the next item in the results list
     * @param {function} [callback] A callback which is triggered when the next item becomes available
     * @return {Promise} A promise which is resolved with the next item
     */
    next(callback?: General.Callback<TInstance>): Promise<TInstance|undefined> {
        return Nodeify(new Promise<TDocument|undefined>((resolve, reject) => {
            this.cursor.next((err: Error, result: TDocument|undefined) => {
                if (err) return reject(err);
                return resolve(result);
            });
        }).then((document) => {
            if (!document) return Promise.resolve<TInstance|undefined>(undefined);
            return this.model.handlers.documentReceived(this.conditions, document, (document, isNew?, isPartial?) => this.model.helpers.wrapDocument(document, isNew, isPartial));
        }), callback);
    }

    /**
     * Retrieves the next item in the result list and then closes the cursor
     * @param {function} [callback] A callback which is triggered when the next item becomes available
     * @return {Promise} A promise which is resolved once the item becomes available and the cursor has been closed.
     */
    one(callback?: General.Callback<TInstance>): Promise<TInstance|undefined> {
        return Nodeify(new Promise<TDocument|undefined>((resolve, reject) => {
            this.cursor.next((err: Error, result: TDocument) => {
                if (err) return reject(err);
                return resolve(result);
            });
        }).then((document) => {
            return new Promise<TDocument|undefined>((resolve, reject) => {
                this.cursor.close((err) => {
                    if (err) return reject(err);
                    return resolve(document);
                });
            });
        }).then((document) => {
            if (!document) return Promise.resolve<TInstance|undefined>(undefined);
            return this.model.handlers.documentReceived(this.conditions, document, (document, isNew?, isPartial?) => this.model.helpers.wrapDocument(document, isNew, isPartial));
        }), callback);
    }

    /**
     * Returns a new cursor which behaves the same as this one did before any results were retrieved
     * @return {Cursor} The new cursor which starts at the beginning of the results
     */
    rewind(): Cursor<TDocument, TInstance> {
        this.cursor.rewind();
        return this;
    }

    /**
     * Returns a new cursor which sorts its results by the given index expression
     * @param {model.IndexSpecification} sortExpression The index expression dictating the sort order and direction to use
     * @return {Cursor} The new cursor which sorts its results by the sortExpression
     */
    sort(sortExpression: Index.IndexSpecification): Cursor<TDocument, TInstance> {
        return new Cursor(this.model, this.conditions, this.cursor.sort(sortExpression));
    }

    /**
     * Returns a new cursor which limits the number of returned results
     * @param {Number} limit The maximum number of results to return
     * @return {Cursor} The new cursor which will return a maximum number of results
     */
    limit(limit: number): Cursor<TDocument, TInstance> {
        return new Cursor(this.model, this.conditions, this.cursor.limit(limit));
    }

    /**
     * Returns a new cursor which skips a number of results before it begins
     * returning any.
     * @param {Number} skip The number of results to skip before the cursor beings returning
     * @return {Cursor} The new cursor which skips a number of results
     */
    skip(skip: number): Cursor<TDocument, TInstance> {
        return new Cursor(this.model, this.conditions, this.cursor.skip(skip));
    }

    /**
     * Returns a new cursor which will read from the specified node type.
     * @param {String} type The type of node to read from - see https://docs.mongodb.org/manual/core/read-preference/
     * @return {Cursor} The new cursor which reads from the specified node type
     */
    readFrom(type: string): Cursor<TDocument, TInstance> {
        return new Cursor(this.model, this.conditions, this.cursor.setReadPreference(type));
    }
}