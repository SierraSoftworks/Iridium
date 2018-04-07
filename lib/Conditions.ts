import { FilterQuery } from "mongodb";

export type Conditions<TDocument = {}> = FilterQuery<TDocument>