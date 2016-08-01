export { ObjectID, Binary } from "mongodb";
import { ObjectID } from "mongodb";

export type BSONType =
    undefined
    |null
    |number
    |string|symbol
    |BSONObject
    |BSONArray
    |ObjectID
    |boolean
    |Date
    |RegExp;

export interface BSONObject {
    [property: string]: BSONType;
}

export interface BSONArray {
    [property: number]: BSONType;
}