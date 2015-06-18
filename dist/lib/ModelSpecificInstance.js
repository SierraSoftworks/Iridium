var util = require('util');
var _ = require('lodash');
function ModelSpecificInstance(model, instanceType) {
    var constructor = function (doc, isNew, isPartial) {
        instanceType.call(this, model, doc, isNew, isPartial);
    };
    util.inherits(constructor, instanceType);
    _.each(Object.keys(model.schema), function (property) {
        if (model.transforms.hasOwnProperty(property)) {
            return Object.defineProperty(constructor.prototype, property, {
                get: function () {
                    return model.transforms[property].fromDB(this._modified[property]);
                },
                set: function (value) {
                    this._modified[property] = model.transforms[property].toDB(value);
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
    return constructor;
}
exports.default = ModelSpecificInstance;

//# sourceMappingURL=../lib/ModelSpecificInstance.js.map