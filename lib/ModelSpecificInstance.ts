/// <reference path="../_references.d.ts" />
import Model from './Model';
import * as ModelInterfaces from './ModelInterfaces';
import util = require('util');
import _ = require('lodash');

export default function ModelSpecificInstance<TDocument extends { _id?: any }, TInstance>(model: Model<TDocument, TInstance>, instanceType: ModelInterfaces.InstanceImplementation<TDocument, TInstance>): new (doc: TDocument, isNew?: boolean, isPartial?: boolean) => TInstance {
    var constructor = function (doc: TDocument, isNew?: boolean, isPartial?: boolean) {
        instanceType.call(this, model, doc, isNew, isPartial);
    };

    util.inherits(constructor, instanceType);

    _.each(Object.keys(model.schema),(property) => {
        if (model.transforms.hasOwnProperty(property)) {
            return Object.defineProperty(constructor.prototype, property, {
                get: function () {
                    return model.transforms[property].fromDB(this._modified._id);
                },
                set: function (value) {
                    this._modified._id = model.transforms[property].toDB(value);
                },
                enumerable: true,
                configurable: true
            });
        }

        Object.defineProperty(constructor.prototype, property, {
            get: function () {
                return this._modified[property];
            },
            set: function (value) {
                this._modified[property] = value;
            },
            enumerable: true
        });
    });

    return <any>constructor;
}
