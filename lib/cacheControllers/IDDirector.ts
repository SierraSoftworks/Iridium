import {CacheDirector} from "../CacheDirector";
import {hasValidObjectID} from "../utils/ObjectID";
import * as MongoDB from "mongodb";

/**
 * Caches documents using their _id field as the unique cache key. This
 * is useful if you primarily query your documents using their _id field,
 * however can be suboptimal (or even a complete waste) if you use different
 * types of queries.
 */
export class CacheOnID implements CacheDirector{
    valid<T>(object: T) {
        if (hasValidObjectID(object)) {
            return !!object._id;
        }

        return false;
    }

    buildKey<T>(object: T) {
        if (hasValidObjectID(object)) {
            if (object._id._bsontype === "ObjectID")
                return new MongoDB.ObjectID(object._id.id).toHexString();
            return object._id;
        }
        
        throw new Error("Cannot build key for object without an _id");
    }

    validQuery(conditions: { _id?: any, [prop: string]: any }) {
        return !!conditions._id;
    }

    buildQueryKey(conditions: { _id: any, [prop: string]: any }) {
        if (conditions._id._bsontype === "ObjectID")
            return new MongoDB.ObjectID(conditions._id.id).toHexString();
        return conditions._id;
    }
}