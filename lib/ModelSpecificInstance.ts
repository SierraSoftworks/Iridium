import {Model} from "./Model";
import {InstanceImplementation, InstanceInternals} from "./InstanceInterface";
import {ModelSpecificInstanceConstructor} from "./ModelInterfaces";
import * as util from "util";
import * as _ from "lodash";

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
export function ModelSpecificInstance<TDocument extends { _id?: any }, TInstance>(model: Model<TDocument, TInstance>, instanceType: InstanceImplementation<TDocument, TInstance>): ModelSpecificInstanceConstructor<TDocument, TInstance> {
    const instanceTypeConstructor = <InstanceConstructor><any>instanceType;
    
    let virtualClass = class extends instanceTypeConstructor {
        constructor(...args: any[]) {
            super(model, ...args);
        }
    }

    _.each(Object.keys(model.schema), (property: keyof TInstance) => {
        return Object.defineProperty(virtualClass.prototype, property, {
            get: function (this: InstanceInternals<TDocument, TInstance>) {
                return this._getField(property)
            },
            set: function (this: InstanceInternals<TDocument, TInstance>, value: any) {
                this._setField(property, value)
            },
            enumerable: true,
            configurable: true
        });
    });

    return <any>virtualClass;
}

interface InstanceConstructor {
    new(...args: any[]): this;
    prototype: any;
}