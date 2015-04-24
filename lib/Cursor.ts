/// <reference path="../_references.d.ts" />
import model = require('./Model');
import general = require('./General');
import MongoDB = require('mongodb');
import Promise = require('bluebird');

export = Cursor;

class Cursor<TDocument, TInstance> {
    constructor(private model: model.Model<TDocument, TInstance>, private conditions: any, private cursor: MongoDB.Cursor) {
        
    }

    /**
     * Counts the number of documents which are matched by this cursor
     * @param {function(Error, Number)} callback A callback which is triggered when the result is available
     */
    count(callback?: general.Callback<number>): Promise<number> {
        return new Promise<number>((resolve, reject) => {
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
     */
    each(handler: (instance: TInstance) => void, callback?: general.Callback<void>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.cursor.each((err, item: TDocument) => {
                if (err) return reject(err);
                if (!item) return resolve(null);
                this.model.handlers.documentReceived(this.conditions, item,(document, isNew?, isPartial?) => this.model.helpers.wrapDocument(document, isNew, isPartial)).then(handler);
            });
        }).nodeify(callback);
    }

    map<TResult>(handler: (instance: TInstance) => TResult | Promise<TResult>, callback?: general.Callback<TResult[]>): Promise<TResult[]> {
        return new Promise<TResult[]>((resolve, reject) => {
            var promises: Promise<TResult>[] = [];
            this.cursor.each((err, item: TDocument) => {
                if (err) return reject(err);
                if (!item) return resolve(Promise.all(promises));
                promises.push(this.model.handlers.documentReceived(this.conditions, item,(document, isNew?, isPartial?) => this.model.helpers.wrapDocument(document, isNew, isPartial))
                    .then(<(instance) => TResult>handler));
            });
        }).nodeify(callback);
    }

    toArray(callback?: general.Callback<TInstance[]>): Promise<TInstance[]> {
        return new Promise<TDocument[]>((resolve, reject) => {
            this.cursor.toArray((err, results: any[]) => {
                if (err) return reject(err);
                return resolve(<any>results);
            });
        }).map<TDocument, TInstance>((document) => {
            return this.model.handlers.documentReceived(this.conditions, document,(document, isNew?, isPartial?) => this.model.helpers.wrapDocument(document, isNew, isPartial));
        }).nodeify(callback);
    }

    next(callback?: general.Callback<TInstance>): Promise<TInstance> {
        return new Promise<TDocument>((resolve, reject) => {
            this.cursor.nextObject((err, result: any) => {
                if (err) return reject(err);
                return resolve(<any>result);
            });
        }).then((document) => {
            return this.model.handlers.documentReceived(this.conditions, document,(document, isNew?, isPartial?) => this.model.helpers.wrapDocument(document, isNew, isPartial));
        }).nodeify(callback);
    }

    rewind(): Cursor<TDocument, TInstance> {
        return new Cursor(this.model, this.conditions, this.cursor.rewind());
    }

    sort(sortExpression: model.IndexSpecification): Cursor<TDocument, TInstance> {
        return new Cursor(this.model, this.conditions, this.cursor.sort(sortExpression));
    }

    limit(number: number): Cursor<TDocument, TInstance> {
        return new Cursor(this.model, this.conditions, this.cursor.limit(number));
    }

    skip(number: number): Cursor<TDocument, TInstance> {
        return new Cursor(this.model, this.conditions, this.cursor.skip(number));
    }
}