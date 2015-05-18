/// <reference path="../_references.d.ts" />
export = Configuration;

interface Configuration {
    host?: string;
    port?: number;
    hosts?: { address: string; port?: number }[];
    database?: string;
    username?: string;
    password?: string;
    [key:string]: any;
}