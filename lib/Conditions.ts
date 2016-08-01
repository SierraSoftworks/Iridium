import {BSONType, BSONArray, ObjectID} from "./BSON";

export interface Conditions {
    [property: string]: {
        $eq?: BSONType;
        $ne?: BSONType;
        $in?: BSONArray;
        $nin?: BSONArray;
        $elemMatch?: Conditions;
        $gt?: BSONType;
        $gte?: BSONType;
        $lt?: BSONType;
        $lte?: BSONType;
    }|BSONType;
}