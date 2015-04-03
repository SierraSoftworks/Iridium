export interface Configuration {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    [key:string]: any;
}