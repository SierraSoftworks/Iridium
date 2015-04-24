/// <reference path="../_references.d.ts" />
import Model = require('./Model');
import General = require('./General');
import MongoDB = require('mongodb');
import Bluebird = require('bluebird');
import Index = require('./Index');

export = Cursor;

class Cursor<TDocument, TInstance> {
    /**
     * Creates a new Iridium cursor which wraps a MongoDB cursor object
     * @param {Model} model The Iridium model that this cursor belongs to
     * @param {Object} conditions The conditions that resulte in this cursor being created
     * @param {MongoDB.Cursor} cursor The MongoDB native cursor object to be wrapped
     * @constructor
     */
    constructor(private model: Model<TDocument, TInstance>, private conditions: any, public cursor: MongoDB.Cursor) {
        
    }

    /**
     * Counts the number of documents which are matched by this cursor
     * @param {function(Error, Number)} callback A callback which is triggered when the result is available
     * @return {Promise<number>} A promise which will resolve with the number of documents matched by this cursor
     */
    count(callback?: General.Callback<number>): Bluebird<number> {
        return new Bluebird<number>((resolve, reject) => {
            this.cursor.count(true,(err, count) => {
                if (err) return reject(err);
                return resolve(<any>count);
            });
        }).nodeify(callback);
    }

    /**
     * Runs the specified handler over each instance in the query results
     * @param {function(Instance)} handler The handler which is triggered for each element in the query
     * @param {function(Error)} callback A callback which is triggered when all operations have been dispatched
     * @return {Promise} A promise which is resolved when all operations have been dispatched
     */
    each(handler: (instance: TInstance) => void, callback?: General.Callback<void>): Bluebird<void> {
        return new Bluebird<void>((resolve, reject) => {
            this.cursor.each((err, item: TDocument) => {
                if (err) return reject(err);
                if (!item) return resolve(null);
                this.model.handlers.documentReceived(this.conditions, item,(document, isNew?, isPartial?) => this.model.helpers.wrapDocument(document, isNew, isPartial)).then(handler);
            });
        }).nodeify(callback);
    }

    /**
     * Runs the specified transform over each instance in the query results and returns the resulting transformed objects
     * @param {function(Instance): TResult} transform A handler which is used to transform the result objects
     * @param {function(Error, TResult[])} callback A callback which is triggered when the transformations are completed
     * @return {Promise<TResult[]>} A promise which is fulfilled with the results of the transformations
     */
    map<TResult>(transform: (instance: TInstance) => TResult | Bluebird<TResult>, callback?: General.Callback<TResult[]>): Bluebird<TResult[]> {
        return new Bluebird<TResult[]>((resolve, reject) => {
            var promises: Bluebird<TResult>[] = [];
            this.cursor.each((err, item: TDocument) => {
                if (err) return reject(err);
                if (!item) return resolve(Bluebird.all(promises));
                promises.push(this.model.handlers.documentReceived(this.conditions, item,(document, isNew?, isPartial?) => this.model.helpers.wrapDocument(document, isNew, isPartial))
                    .then(<(instance) => TResult>transform));
            });
        }).nodeify(callback);
    }

    /**
     * Retrieves all matching instances and returns them in an array
     * @param {function(Error, TInstance[])} callback A callback which is triggered with the resulting instances
     * @return {Promise<TInstance[]>} A promise which resolves with the instances returned by the query
     */
    toArray(callback?: General.Callback<TInstance[]>): Bluebird<TInstance[]> {
        return new Bluebird<TDocument[]>((resolve, reject) => {
            this.cursor.toArray((err, results: any[]) => {
                if (err) return reject(err);
                return resolve(<any>results);
            });
        }).map<TDocument, TInstance>((document) => {
            return this.model.handlers.documentReceived(this.conditions, document,(document, isNew?, isPartial?) => this.model.helpers.wrapDocument(document, isNew, isPartial));
        }).nodeify(callback);
    }

    /**
     * Retrieves the next item in the results list
     * @param {function(Error, TInstance)} callback A callback which is triggered when the next item becomes available
     * @return {Promise<TInstance>} A promise which is resolved with the next item
     */
    next(callback?: General.Callback<TInstance>): Bluebird<TInstance> {
        return new Bluebird<TDocument>((resolve, reject) => {
            this.cursor.nextObject((err, result: any) => {
                if (err) return reject(err);
                return resolve(<any>result);
            });
        }).then((document) => {
            return this.model.handlers.documentReceived(this.conditions, document,(document, isNew?, isPartial?) => this.model.helpers.wrapDocument(document, isNew, isPartial));
        }).nodeify(callback);
    }

    /**
     * Returns a new cursor which behaves the same as this one did before any results were retrieved
     * @return {Cursor} The new cursor which starts at the beginning of the results
     */
    rewind(): Cursor<TDocument, TInstance> {
        return new Cursor(this.model, this.conditions, this.cursor.rewind());
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
}