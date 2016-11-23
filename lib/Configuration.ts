import * as MongoDB from "mongodb";

export interface Configuration {
    host?: string;
    port?: number;
    hosts?: { address: string; port?: number }[];
    database?: string;
    username?: string;
    password?: string;

    options?: MongoDB.MongoClientOptions;

    [key:string]: any;
}