/// <reference path="../_references.d.ts" />
var Iridium = require('../index');
describe("Middleware", function () {
    var core = new Iridium.Core({
        database: 'test'
    });
    describe("Express", function () {
        beforeEach(function () { return core.close(); });
        it("should be available through Core.express()", function () {
            chai.expect(core.express).to.exist.and.be.a('function');
        });
        it("should return a function", function () {
            chai.expect(core.express()).to.exist.and.be.a('function');
        });
        it("which sets req.db to the core instance", function (done) {
            var req = {};
            var res = {};
            core.express()(req, res, function (err) {
                if (err)
                    return done(err);
                chai.expect(req.db).to.exist.and.be.an.instanceof(Iridium.Core);
                return done();
            });
        });
        it("which checks that the core is connected", function (done) {
            var req = {};
            var res = {};
            core.express()(req, res, function (err) {
                if (err)
                    return done(err);
                chai.expect(core.connection).to.exist;
                return done();
            });
        });
    });
});
//# sourceMappingURL=Middleware.js.map