/// <reference path="../_references.d.ts" />
import Model = require('./Model');
import ModelInterfaces = require('./ModelInterfaces');
import util = require('util');
import _ = require('lodash');

export = ModelSpecificInstance;

function ModelSpecificInstance<TDocument extends { _id?: any }, TInstance>(model: Model<TDocument, TInstance>, instanceType: ModelInterfaces.InstanceImplementation<TDocument, TInstance>): new (doc: TDocument, isNew?: boolean, isPartial?: boolean) => TInstance {
    var constructor = function (doc: TDocument, isNew?: boolean, isPartial?: boolean) {
        instanceType.call(this, model, doc, isNew, isPartial);
    };

    util.inherits(constructor, instanceType);

    _.each(Object.keys(model.schema),(property) => {
        if (property === '_id') {
            return Object.defineProperty(constructor.prototype, property, {
                get: function () {
                    return model.options.identifier.apply(this._modified._id);
                },
                set: function (value) {
                    this._modified._id = model.options.identifier.reverse(value);
                },
                enumerable: true
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
