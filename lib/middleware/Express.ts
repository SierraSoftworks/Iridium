import * as http from "http";
import {MiddlewareFactory} from "../Middleware";
import {Core} from "../Core";

/**
 * A factory method which creates Express/Connect compatible middleware functions to inject
 * a "db" field on your request objects as well as ensuring that the Iridium Core is connected
 * to a MongoDB database before handling any requests.
 *
 * @internal
 */
export function ExpressMiddlewareFactory(core: Core): ExpressMiddleware {
    return function (req: http.ServerRequest, res: http.ServerResponse, next:(err?: Error, route?: String) => void) {
        core.connect().then(function() {
            Object.defineProperty(req, "db", {
                get: function() { return core; }
            });
            next();
        }).catch(next);
    };
}

/**
 * An Express/Connect compatible middleware function which injects req.db and ensures that the Iridium Core
 * has an active database connection before continuing the request handling process.
 */
export interface ExpressMiddleware {
    (req: http.ServerRequest, res: http.ServerResponse, next:(err?: Error, route?: String) => void): void;
}