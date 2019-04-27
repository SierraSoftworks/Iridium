"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skmatc = require("skmatc");
class TimestampsPlugin {
    constructor() {
        this.validate = [
            Skmatc.create((schema) => schema === "readonly", function (schema, data, path) { return this.fail("no changes allowed"); })
        ];
    }
    newModel(model) {
        Object.assign(model.schema, {
            createdAt: "readonly",
            updatedAt: "readonly"
        });
        const oldOnCreating = model.hooks.onCreating;
        model.hooks.onCreating = (doc) => {
            oldOnCreating && oldOnCreating(doc);
            doc.createdAt = new Date();
            doc.updatedAt = new Date();
        };
        const oldOnSaving = model.hooks.onSaving;
        model.hooks.onSaving = (instance, changes) => {
            oldOnSaving && oldOnSaving(instance, changes);
            changes.$set = Object.assign(changes.$set, {
                updatedAt: new Date()
            });
        };
    }
}
exports.TimestampsPlugin = TimestampsPlugin;
//# sourceMappingURL=Timestamps.js.map