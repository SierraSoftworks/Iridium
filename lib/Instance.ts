/// <reference path='../typings/node/node.d.ts' />
/// <reference path='../typings/mongodb/mongodb.d.ts' />
/// <reference path='../typings/lodash/lodash.d.ts' />
/// <reference path='../typings/bluebird/bluebird.d.ts' />
/// <reference path="Core.ts" />
/// <reference path="Model.ts" />

import iridium = require('./Core');
import model = require('./Model');
import IPlugin = require('./Plugins');
import _ = require('lodash');
import Promise = require('bluebird');

import general = require('./General');

export interface IInstanceFactory<TSchema, TInstance extends IInstance<any, any>> {
    (document: any, isNew?: boolean, isPartial?: boolean): TInstance;
}

export interface IInstance<TSchema, TInstance extends IInstance<any, any>> {
    save(callback?: general.Callback<TInstance>): Promise<TInstance>;
    save(changes: Object, callback?: general.Callback<TInstance>): Promise<TInstance>;
    save(conditions: Object, changes: Object, callback?: general.Callback<TInstance>): Promise<TInstance>;

    update(callback?: general.Callback<TInstance>): Promise<TInstance>;
    refresh(callback?: general.Callback<TInstance>): Promise<TInstance>;

    delete(callback?: general.Callback<TInstance>): Promise<TInstance>;
    remove(callback?: general.Callback<TInstance>): Promise<TInstance>;

    document?: TSchema;

    first<T>(collection: T[], predicate: general.Predicate<T>): T;
    first<T>(collection: { [key: string]: T }, predicate: general.Predicate<T>): T;

    select<T>(collection: T[], predicate: general.Predicate<T>): T[];
    select<T>(collection: { [key: string]: T }, predicate: general.Predicate<T>): { [key: string]: T };
}



export class Instance<TSchema, TInstance extends IInstance<any, any>> implements IInstance<TSchema, TInstance> {
    constructor(model: model.Model<TSchema, TInstance>, document: TSchema, isNew: boolean = false, isPartial: boolean = false) {
            this._model = model;

            this._isNew = !!isNew;
            this._isPartial = isPartial;
            this._original = document;
            this._modified = _.cloneDeep(document);

            _.each(model.core.plugins, function(plugin : IPlugin) {
                if(plugin.newInstance) plugin.newInstance(this, model);
            });
        }

        private _isNew: boolean;
        private _isPartial: boolean;
        private _model: model.Model<TSchema, TInstance>;
        private _original: TSchema;
        private _modified: TSchema;

        get document(): TSchema {
            return this._modified;
        }

        [name: string]: any;


        save(callback?: general.Callback<TInstance>): Promise<TInstance>;
        save(changes: Object, callback?: general.Callback<TInstance>): Promise<TInstance>;
        save(conditions: Object, changes: Object, callback?: general.Callback<TInstance>): Promise<TInstance>;
        save(...args: any[]): Promise<TInstance> {
            var callback: general.Callback<TSchema> = null;
            var changes: any = null;
            var conditions: any = {};

            Array.prototype.slice.call(args, 0).reverse().forEach(function(arg) {
                if(typeof arg == 'function') callback = arg;
                else if(typeof arg == 'object') {
                    if(!changes) changes = arg;
                    else conditions = arg;
                }
            });

            return Promise.resolve().then(function() {
                _.merge(conditions, this._model.helpers.selectOneDownstream(this._modified));

                this._model.helpers.transform.reverse(conditions);

                if(!changes) {
                    var validation = this._model.helpers.validate(this._modified);
                    if(validation.failed) return Promise.reject(validation.error).bind(this).nodeify(callback);

                    var original = _.cloneDeep(this._original);
                    var modified = _.cloneDeep(this._modified);

                    changes = this._model.helpers.diff(original, modified);
                }
            }).then(function() {
                return this._model.handlers.savingDocument(this, changes);
            }).then(function() {
                return new Promise<boolean>(function(resolve: (changed: boolean) => void, reject) {
                    this._model.collection.update(conditions, changes, { w: 1 }, function(err: Error, changed: boolean) {
                        if(err) return reject(err);
                        return resolve(changed);
                    });
                });
            }).then(function(changed: boolean) {
                conditions = this._model.helpers.selectOne(this.modified);
                if(!changed) return this._modified;

                return new Promise<any>(function(resolve, reject) {
                    this._model.collection.findOne(conditions, function(err: Error, latest) {
                        if(err) return reject(err);
                        return resolve(latest);
                    });
                });
            }).then(function(latest) {
                return this._model.handlers.documentsReceived(conditions, [latest], function(value: TSchema) {
                    this._model.helpers.transform.apply(value);
                    this._isPartial = false;
                    this._isNew = false;
                    this._original = value;
                    this._modified = _.clone(value);
                    return this;
                });
            }).nodeify(callback);
        }

        update(callback?: general.Callback<TInstance>): Promise<TInstance> {
            return this.refresh(callback);
        }

        refresh(callback?: general.Callback<TInstance>): Promise<TInstance> {
            var conditions = this._model.helpers.selectOne(this._original);

            return Promise.resolve().then(function() {
                return new Promise<any>(function(resolve, reject) {
                    this._model.collection.findOne(conditions, function(err: Error, doc: any) {
                        if(err) return reject(err);
                        return resolve(doc);
                    });
                });
            }).then(function(doc) {
                if(!doc) {
                    this._isPartial = true;
                    this._isNew = true;
                    this._original = _.cloneDeep(this._modified);
                    return this;
                }

                return this._model.handle.documentsReceived(conditions, [doc], this._model.helpers.transform.apply, { wrap: false }).then(function(doc : any) {
                    this._model.helpers.transformFromSource(doc);
                    this._isNew = false;
                    this._isPartial = false;
                    this._original = doc;
                    this._modified = _.cloneDeep(doc);

                    this._model._helpers.transformDown(doc);

                    return this;
                });
            }).nodeify(callback);
        }

        delete(callback?: general.Callback<TInstance>): Promise<TInstance> {
            return this.remove(callback);
        }

        remove(callback?: general.Callback<TInstance>): Promise<TInstance> {
            var conditions = this._model.helpers.selectOne(this._original);

            return Promise.resolve().then(function() {
                if(this._isNew) return 0;
                return new Promise<number>(function(resolve: (value: number) => void, reject) {
                    this._model.collection.remove(conditions, function(err: Error, removed?: number) {
                        if(err) return reject(err);
                        return resolve(removed);
                    });
                });
            }).then(function(removed){
                if(removed) return this._model.cache.remove(conditions);
            }).nodeify(callback);
        }

        first<T>(collection: T[], predicate: general.Predicate<T>): T;
        first<T>(collection: { [key: string]: T }, predicate: general.Predicate<T>): T;
        first<T>(collection: T[] | { [key: string]: T }, predicate: general.Predicate<T>): T {
            var result = null;

            _.each(collection, function (value : T, key) {
                if (predicate.call(this, value, key)) {
                    result = value;
                    return false;
                }
            }, this);

            return result;
        }

        select<T>(collection: T[], predicate: general.Predicate<T>): T[];
        select<T>(collection: { [key: string]: T }, predicate: general.Predicate<T>): { [key: string]: T };
        select<T>(collection: T[] | { [key: string]: T }, predicate: general.Predicate<T>): any {
            var isArray = Array.isArray(collection);
            var results: any = isArray ? [] : {};

            _.each(collection, function (value : T, key) {
                if (predicate.call(this, value, key)) {
                    if (isArray) results.push(value);
                    else results[key] = value;
                }
            }, this);

            return results;
        }
    }
