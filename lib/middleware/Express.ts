/// <reference path="../../_references.d.ts" />
import http = require('http');
import Middleware = require('../Middleware');
import Core = require('../Core');

export function ExpressMiddlewareFactory(core: Core): ExpressMiddleware {
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