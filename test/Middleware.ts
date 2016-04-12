import * as Iridium from "../iridium";
import * as chai from "chai";

describe("Middleware",() => {
    let core = new Iridium.Core({
        database: "test"
    });

    describe("Express",() => {
        beforeEach(() => core.close());

        it("should be available through Core.express()",() => {
            chai.expect(core.express).to.exist.and.be.a("function");
        });

        it("should return a function",() => {
            chai.expect(core.express()).to.exist.and.be.a("function");
        });

        it("which sets req.db to the core instance",(done) => {
            let req: any  = {};
            let res: any = {};
            core.express()(req, res,(err) => {
                if (err) return done(err);
                chai.expect(req.db).to.exist.and.be.an.instanceof(Iridium.Core);
                return done();
            });
        });

        it("which checks that the core is connected",(done) => {
            let req: any = {};
            let res: any = {};
            core.express()(req, res,(err) => {
                if (err) return done(err);
                chai.expect(core.connection).to.exist;
                return done();
            });
        });
    });
});