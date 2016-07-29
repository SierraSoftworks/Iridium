import {Conditions, UnderlyingBSONType} from "./Conditions";

export interface Changes {
    $set?: {
        [property: string]: UnderlyingBSONType;
    };

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
            $each: UnderlyingBSONType[];
        }|any;
    }

    $push?: {
        [property: string]: {
            $each: UnderlyingBSONType[];
            $slice?: number;
            $position?: number; 
        }|{
            $each: UnderlyingBSONType[];
            $slice: number;
            $sort: { [property: string]: number; };
            $position?: number; 
        }|UnderlyingBSONType;
    };

    $pull?: {
        [property: string]: Conditions;
    };

    $pullAll?: {
        [property: string]: UnderlyingBSONType[];
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