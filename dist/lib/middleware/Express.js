"use strict";
/**
 * A factory method which creates Express/Connect compatible middleware functions to inject
 * a "db" field on your request objects as well as ensuring that the Iridium Core is connected
 * to a MongoDB database before handling any requests.
 *
 * @internal
 */
function ExpressMiddlewareFactory(core) {
    return function (req, res, next) {
        core.connect().then(function () {
            Object.defineProperty(req, "db", {
                get: function () { return core; }
            });
            next();
        }).catch(next);
    };
}
exports.ExpressMiddlewareFactory = ExpressMiddlewareFactory;
//# sourceMappingURL=Express.js.map