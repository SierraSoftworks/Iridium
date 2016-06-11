"use strict";
const _ = require("lodash");
/**
 * Creates a new subclass of the given instanceType which correctly performs property transforms
 * and associates the instance with the correct model when instantiated.
 *
 * @param TDocument The interface representing the structure of the documents found in the database.
 * @param TInstance The interface or class representing the documents after they have been wrapped in an instance.
 *
 * @param model The model which instances should be associated with when the resulting constructor is used.
 * @param instanceType The constructor used to create new instances of type TInstance.
 *
 * @internal
 */
function ModelSpecificInstance(model, instanceType) {
    const instanceTypeConstructor = instanceType;
    let virtualClass = class extends instanceTypeConstructor {
        constructor(...args) {
            super(model, ...args);
        }
    }
    ;
    _.each(Object.keys(model.schema), (property) => {
        if (model.transforms.hasOwnProperty(property)) {
            return Object.defineProperty(virtualClass.prototype, property, {
                get: function () {
                    return model.transforms[property].fromDB(this._modified[property], property, model);
                },
                set: function (value) {
                    this._modified[property] = model.transforms[property].toDB(value, property, model);
                },
                enumerable: true,
                configurable: true
            });
        }
        Object.defineProperty(virtualClass.prototype, property, {
            get: function () {
                return this._modified[property];
            },
            set: function (value) {
                this._modified[property] = value;
            },
            enumerable: true
        });
    });
    return virtualClass;
}
exports.ModelSpecificInstance = ModelSpecificInstance;
//# sourceMappingURL=ModelSpecificInstance.js.map