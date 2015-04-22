/// <reference path="../_references.d.ts" />
import Iridium = require('../index');

class InheritedCore extends Iridium.Core {
    theAnswer = 42;
}

class InheritedCoreWithCustomConstructor extends Iridium.Core {
    constructor() {
        super("mongodb://localhost/test");
    }
}

describe("Core",() => {
    describe("constructor",() => {
        it("should accept a URI string",() => {
            var core = new Iridium.Core("mongodb://localhost/test");
            chai.expect(core.url).to.equal("mongodb://localhost/test");
        });

        it("should accept a configuration object",() => {
            new Iridium.Core({
                database: 'test'
            });
        });

        it("should correctly convert the configuration object into a URI string",() => {
            var core = new Iridium.Core({
                host: 'localhost',
                port: 27016,
                database: 'test',
                username: 'user',
                password: 'password'
            });

            chai.expect(core.url).to.equal("mongodb://user:password@localhost:27016/test");
        });

        it("should make logical assumptions about the default host",() => {
            var core = new Iridium.Core({
                database: 'test'
            });

            chai.expect(core.url).to.equal("mongodb://localhost/test");
        });
    });

    describe("plugins",() => {
        var core = new Iridium.Core({
            database: 'test'
        });

        var plugin = {
            newModel: (model) => {

            }
        };

        it("should be registered through the register method",() => {
            chai.expect(core.register(plugin)).to.equal(core);
        });
        it("should then be available through the plugins collection",() => {
            chai.expect(core.plugins).to.contain(plugin);
        });
    });

    describe("middleware",() => {
        var core = new Iridium.Core({
            database: 'test'
        });

        it("should have an Express provider",() => {
            chai.expect(core.express).to.exist.and.be.a('function');
        });
    });

    describe("cache",() => {
        var core = new Iridium.Core({
            database: 'test'
        });

        it("should have a default no-op cache provider",() => {
            chai.expect(core.cache).to.exist;
            return core.cache.set("test", true).then(() => {
                chai.expect(core.cache.get("test")).to.eventually.not.exist;
            });
        });
    });

    describe("connect",() => {
        var core: Iridium.Core;
        if (!process.env.CI)
            it("should return a rejection if the connection fails",() => {
                core = new Iridium.Core("mongodb://0.0.0.0/test");
                return chai.expect(core.connect()).to.be.rejected;
            });
        else it.skip("should return a rejection if the connection fails");
        
        it("should open a connection to the correct database and return the core",() => {
            core = new Iridium.Core("mongodb://localhost/test");
            return chai.expect(core.connect()).to.eventually.exist.and.equal(core);
        });

        it("should then be able to close the connection",() => {
            return core.close();
        });
    });

    describe("close",() => {
        var core = new Iridium.Core("mongodb://localhost/test");

        it("should not fail if called when not connected",() => {
            return core.close();
        });

        it("should chain promises",() => {
            chai.expect(core.close()).to.eventually.equal(core);
        });
    });

    describe("inheritance",() => {
        it("should allow a class to extend the core",() => {
            chai.expect(InheritedCore).to.exist;
            chai.expect(new InheritedCore("mongodb://localhost/test")).to.be.an.instanceof(Iridium.Core);
        });

        it("should pass through constructor arguments to the core",() => {
            var core = new InheritedCore({
                database: 'test'
            });

            chai.expect(core.url).to.equal("mongodb://localhost/test");
        });

        it("should pass through the properties of the object",() => {
            var core = new InheritedCore({
                database: 'test'
            });

            chai.expect(core.theAnswer).to.equal(42);
        });

        it("should support custom constructors",() => {
            var core = new InheritedCoreWithCustomConstructor();
            chai.expect(core.url).to.equal("mongodb://localhost/test");
        });
    });
});
