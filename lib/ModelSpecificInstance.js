var util = require('util');
var _ = require('lodash');
function ModelSpecificInstance(model, instanceType) {
    var constructor = function (doc, isNew, isPartial) {
        instanceType.call(this, model, doc, isNew, isPartial);
    };
    util.inherits(constructor, instanceType);
    _.each(Object.keys(model.schema), function (property) {
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
module.exports = ModelSpecificInstance;
//# sourceMappingURL=ModelSpecificInstance.js.map