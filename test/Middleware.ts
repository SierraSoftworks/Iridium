/// <reference path="../_references.d.ts" />
import Iridium = require('../index');

describe("Middleware",() => {
    var core = new Iridium.Core({
        database: 'test'
    });

    describe("Express",() => {
        beforeEach(() => core.close());

        it("should be available through Core.express()",() => {
            chai.expect(core.express).to.exist.and.be.a('function');
        });

        it("should return a function",() => {
            chai.expect(core.express()).to.exist.and.be.a('function');
        });

        it("which sets req.db to the core instance",(done) => {
            var req: any  = {};
            var res: any = {};
            core.express()(req, res,(err) => {
                if (err) return done(err);
                chai.expect(req.db).to.exist.and.be.an.instanceof(Iridium.Core);
                return done();
            });
        });

        it("which checks that the core is connected",(done) => {
            var req: any = {};
            var res: any = {};
            core.express()(req, res,(err) => {
                if (err) return done(err);
                chai.expect(core.connection).to.exist;
                return done();
            });
        });
    });
});