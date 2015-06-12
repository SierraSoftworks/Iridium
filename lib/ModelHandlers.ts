/// <reference path="../_references.d.ts" />
import Core from './Core';
import {Schema} from './Schema';
import Model from './Model';
import ModelCache from './ModelCache';
import * as ModelOptions from './ModelOptions';

import _ = require('lodash');
import MongoDB = require('mongodb');
import Bluebird = require('bluebird');

export default class ModelHandlers<TDocument extends { _id?: any }, TInstance> {
    constructor(public model: Model<TDocument, TInstance>) {

    }

    documentReceived<TResult>(conditions: any,
        result: TDocument,
        wrapper: (document: TDocument, isNew?: boolean, isPartial?: boolean) => TResult,
        options: ModelOptions.QueryOptions = {}): Bluebird<TResult> {
        _.defaults(options, {
            cache: true,
            partial: false
        });

        return Bluebird.resolve(result).then((target: any) => {
            return <Bluebird<TResult>>Bluebird.resolve().then(() => {

                // Cache the document if caching is enabled
                if (this.model.core.cache && options.cache && !options.fields) {
                    this.model.cache.set(target); // Does not block execution pipeline - fire and forget
                }
                
                // Trigger the received hook
                if (this.model.hooks.onRetrieved) this.model.hooks.onRetrieved(target);

                // Wrap the document and trigger the ready hook

                if (this.model.hooks.onReady && wrapped instanceof this.model.Instance) this.model.hooks.onReady(<TInstance><any>wrapped);
                return wrapped;
            });
        });
    }

    creatingDocuments(documents: TDocument[]): Bluebird<any[]> {
        return Bluebird.all(documents.map((document: any) => {
            return Bluebird.resolve().then(() => {
                if (this.model.hooks.onCreating) this.model.hooks.onCreating(document);
                document = this.model.helpers.convertToDB(document);
                let validation: Skmatc.Result = this.model.helpers.validate(document);
                if (validation.failed) return Bluebird.reject(validation.error);
                
                return document;
            });
        }));
    }

    savingDocument(instance: TInstance, changes: any): Bluebird<TInstance> {
        return Bluebird.resolve().then(() => {
            if (this.model.hooks.onSaving) this.model.hooks.onSaving(instance, changes);
            return instance;
        });
    }
}
