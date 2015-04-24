/// <reference path="../_references.d.ts" />
import Model = require('./Model');
import ModelInterfaces = require('./ModelInterfaces');
import util = require('util');
import _ = require('lodash');

export = ModelSpecificInstance;

function ModelSpecificInstance<TDocument, TInstance>(model: Model<TDocument, TInstance>, instanceType: ModelInterfaces.InstanceConstructor<TDocument, TInstance>): new (doc: TDocument, isNew?: boolean, isPartial?: boolean) => TInstance {
    var constructor = function (doc: TDocument, isNew?: boolean, isPartial?: boolean) {
        instanceType.call(this, model, doc, isNew, isPartial);
    };

    util.inherits(constructor, instanceType);

    _.each(Object.keys(model.schema),(property) => {
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
