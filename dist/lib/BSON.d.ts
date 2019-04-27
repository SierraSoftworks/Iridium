export { ObjectID, Binary } from "mongodb";
import { ObjectID } from "mongodb";
export declare type BSONType = undefined | null | number | string | symbol | BSONObject | BSONArray | ObjectID | boolean | Date | RegExp;
export interface BSONObject {
    [property: string]: BSONType;
}
export interface BSONArray extends Array<BSONType> {
}
