import {ObjectID} from "mongodb";

export type UnderlyingBSONType = null
    |number
    |string|symbol
    |{[property: string]: UnderlyingBSONType;}
    //|UnderlyingBSONType[]
    |ObjectID
    |boolean
    |Date
    |RegExp;

export interface Conditions {
    [property: string]: {
        $eq?: UnderlyingBSONType;
        $ne?: UnderlyingBSONType;
        $in?: UnderlyingBSONType[];
        $nin?: UnderlyingBSONType[];
        $elemMatch?: Conditions;
        $gt?: UnderlyingBSONType;
        $gte?: UnderlyingBSONType;
        $lt?: UnderlyingBSONType;
        $lte?: UnderlyingBSONType;
    }|UnderlyingBSONType;
}