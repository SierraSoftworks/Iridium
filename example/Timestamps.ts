import Iridium = require("../iridium");
import Skmatc = require("skmatc");

export interface TimestampsDoc {
    createdAt?: Date;
    updatedAt?: Date;
}

export class TimestampsPlugin implements Iridium.Plugin {
    newModel(model: Iridium.Model<any, any>): void {
        Object.assign(model.schema, {
            createdAt: "readonly",
            updatedAt: "readonly"
        })
        
        const oldOnCreating = model.hooks.onCreating
        model.hooks.onCreating = (doc: any) => {
            oldOnCreating && oldOnCreating(doc)

            doc.createdAt = new Date()
            doc.updatedAt = new Date()
        }
        
        const oldOnSaving = model.hooks.onSaving
        model.hooks.onSaving = (instance: Iridium.Instance<any, any>, changes: Iridium.Changes) => {
            oldOnSaving && oldOnSaving(instance, changes)

            changes.$set = Object.assign(changes.$set, {
                updatedAt: new Date()
            })
        }
    }

    validate = [
        Skmatc.create((schema) => schema === "readonly", function (schema, data, path) { return this.fail("no changes allowed") })
    ];
}