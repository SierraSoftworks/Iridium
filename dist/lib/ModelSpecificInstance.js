"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require("lodash");
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
    var instanceTypeConstructor = instanceType;
    var virtualClass = (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.apply(this, [model].concat(args));
        }
        return class_1;
    }(instanceTypeConstructor));
    _.each(Object.keys(model.schema), function (property) {
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
