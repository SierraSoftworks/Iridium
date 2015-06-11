/// <reference path="../../_references.d.ts" />
import http = require('http');
import {MiddlewareFactory} from '../Middleware';
import Core from '../Core';

export default function ExpressMiddlewareFactory(core: Core): ExpressMiddleware {
    return function (req: http.ServerRequest, res: http.ServerResponse, next:(err?: Error, route?: String) => void) {
        core.connect().then(function() {
            Object.defineProperty(req, 'db', {
                get: function() { return core; }
            });
            next();
        }).catch(next);
    };
}

export interface ExpressMiddleware {
    (req: http.ServerRequest, res: http.ServerResponse, next:(err?: Error, route?: String) => void);
}