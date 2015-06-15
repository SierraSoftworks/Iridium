function ExpressMiddlewareFactory(core) {
    return function (req, res, next) {
        core.connect().then(function () {
            Object.defineProperty(req, 'db', {
                get: function () { return core; }
            });
            next();
        }).catch(next);
    };
}
exports.default = ExpressMiddlewareFactory;

//# sourceMappingURL=../../lib/middleware/Express.js.map