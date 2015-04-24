/// <reference path="../../_references.d.ts" />
import http = require('http');
import Core = require('../Core');
export declare function ExpressMiddlewareFactory(core: Core): ExpressMiddleware;
export interface ExpressMiddleware {
    (req: http.ServerRequest, res: http.ServerResponse, next: (err?: Error, route?: String) => void): any;
}
