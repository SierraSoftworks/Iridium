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
exports.ExpressMiddlewareFactory = ExpressMiddlewareFactory;
//# sourceMappingURL=Express.js.map