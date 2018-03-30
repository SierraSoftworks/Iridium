import {Conditions} from "./Conditions";
import {BSONType, BSONArray, BSONObject} from "./BSON";

export interface Changes {
    $set?: BSONObject;

    $unset?: {
        [property: string]: boolean;
    };

    $inc?: {
        [property: string]: number;
    };

    $mul?: {
        [property: string]: number;
    };

    $addToSet?: {
        [property: string]: {
            $each: BSONArray;
        }|BSONType;
    }

    $push?: {
        [property: string]: {
            $each: BSONArray;
            $slice: number;
            $sort: { [property: string]: number; };
            $position?: number; 
        }|{
            $each: BSONArray;
            $slice?: number;
            $position?: number; 
        }|BSONType;
    };

    $pull?: {
        [property: string]: Conditions<any>;
    };

    $pullAll?: {
        [property: string]: BSONArray;
    };

    $rename?: {
        [property: string]: string;
    };

    $min?: {
        [property: string]: number;
    };

    $max?: {
        [property: string]: number;
    };

    $currentDate?: {
        [property: string]: boolean|{ $type: "timestamp"|"date" };
    };

    $bit?: {
        [property: string]: { and: number; }|{ or: number; }|{ xor: number; }
    }
}