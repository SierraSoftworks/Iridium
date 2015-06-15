/// <reference path="../_references.d.ts" />
import MongoDB = require('mongodb');

export interface Index {
    spec: IndexSpecification;
    options?: MongoDB.IndexOptions;
}

export interface IndexSpecification {
    [key: string]: number;
}