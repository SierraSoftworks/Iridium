import * as MongoDB from "mongodb";

export interface Index {
    spec: IndexSpecification;
    options?: MongoDB.IndexOptions;
}

export interface IndexSpecification {
    [key: string]: number | string;
}