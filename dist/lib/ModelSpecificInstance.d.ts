import { Model } from "./Model";
import { InstanceImplementation } from "./InstanceInterface";
import { ModelSpecificInstanceConstructor } from "./ModelInterfaces";
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
export declare function ModelSpecificInstance<TDocument extends {
    _id?: any;
}, TInstance>(model: Model<TDocument, TInstance>, instanceType: InstanceImplementation<TDocument, TInstance>): ModelSpecificInstanceConstructor<TDocument, TInstance>;
