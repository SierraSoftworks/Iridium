/// <reference path="../_references.d.ts" />
import * as Iridium from '../index';

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
            let core = new Iridium.Core("mongodb://localhost/test");
            chai.expect(core.url).to.equal("mongodb://localhost/test");
        });

        it("should accept a configuration object",() => {
            new Iridium.Core({
                database: 'test'
            });
        });

        it("should throw an error if no URI or configuration object was provided",() => {
            chai.expect(() => new Iridium.Core('')).to.throw("Expected either a URI or config object to be supplied when initializing Iridium");
        });

        describe("should correctly convert the configuration object into a URI string", () => {
            it("when only a single host is specified",() => {
                let core = new Iridium.Core({
                    host: 'localhost',
                    port: 27016,
                    database: 'test',
                    username: 'user',
                    password: 'password'
                });
    
                chai.expect(core.url).to.equal("mongodb://user:password@localhost:27016/test");
            });
            
            it("when only a single host is specified with no port",() => {
                let core = new Iridium.Core({
                    host: 'localhost',
                    database: 'test',
                    username: 'user',
                    password: 'password'
                });
    
                chai.expect(core.url).to.equal("mongodb://user:password@localhost/test");
            });
            
            it("when multiple hosts are specified",() => {
                let core = new Iridium.Core({
                    hosts: [{ address: 'localhost' }, { address: '127.0.0.1' }],
                    database: 'test',
                    port: 27016,
                    username: 'user',
                    password: 'password'
                });
    
                chai.expect(core.url).to.equal("mongodb://user:password@localhost:27016,127.0.0.1:27016/test");
            });
            
            it("when multiple hosts are specified with no port",() => {
                let core = new Iridium.Core({
                    hosts: [{ address: 'localhost' }, { address: '127.0.0.1' }],
                    database: 'test',
                    username: 'user',
                    password: 'password'
                });
    
                chai.expect(core.url).to.equal("mongodb://user:password@localhost,127.0.0.1/test");
            });
            
            it("when multiple hosts are specified with different ports",() => {
                let core = new Iridium.Core({
                    hosts: [{ address: 'localhost', port: 27016 }, { address: '127.0.0.1', port: 27017 }],
                    database: 'test',
                    username: 'user',
                    password: 'password'
                });
    
                chai.expect(core.url).to.equal("mongodb://user:password@localhost:27016,127.0.0.1:27017/test");
            });
            
            it("when a combination of single and multiple hosts is specified",() => {
                let core = new Iridium.Core({
                    host: 'localhost',
                    port: 27016,
                    hosts: [{ address: 'localhost', port: 27017 }, { address: '127.0.0.1', port: 27018 }],
                    database: 'test',
                    username: 'user',
                    password: 'password'
                });
    
                chai.expect(core.url).to.equal("mongodb://user:password@localhost:27016,localhost:27017,127.0.0.1:27018/test");
            });
            
            it("when a combination of single and multiple hosts is specified and there are duplicates",() => {
                let core = new Iridium.Core({
                    host: 'localhost',
                    port: 27016,
                    hosts: [{ address: 'localhost', port: 27016 }, { address: '127.0.0.1', port: 27017 }],
                    database: 'test',
                    username: 'user',
                    password: 'password'
                });
    
                chai.expect(core.url).to.equal("mongodb://user:password@localhost:27016,127.0.0.1:27017/test");
            });
        });

        it("should make logical assumptions about the default host",() => {
            let core = new Iridium.Core({
                database: 'test'
            });

            chai.expect(core.url).to.equal("mongodb://localhost/test");
        });
    });

    describe("plugins",() => {
        let core = new Iridium.Core({
            database: 'test'
        });

        let plugin = {
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
        let core = new Iridium.Core({
            database: 'test'
        });

        it("should have an Express provider",() => {
            chai.expect(core.express).to.exist.and.be.a('function');
            chai.expect(core.express()).to.exist.and.be.a('function');
        });
    });

    describe("cache",() => {
        let core = new Iridium.Core({
            database: 'test'
        });

        it("should have a default no-op cache provider",() => {
            chai.expect(core.cache).to.exist;
            core.cache.set("test", true);
            chai.expect(core.cache.get("test")).to.eventually.not.exist;
        });
    });

    describe("settings",() => {
        it("should be exposed via the settings property",() => {
            let core = new Iridium.Core({ database: 'test' });
            chai.expect(core.settings).to.exist.and.eql({ database: 'test' });
        });
    });

    describe("connect",() => {
        let core: Iridium.Core;
        if (!process.env.CI_SERVER)
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
        let core = new Iridium.Core("mongodb://localhost/test");

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
            let core = new InheritedCore({
                database: 'test'
            });

            chai.expect(core.url).to.equal("mongodb://localhost/test");
        });

        it("should pass through the properties of the object",() => {
            let core = new InheritedCore({
                database: 'test'
            });

            chai.expect(core.theAnswer).to.equal(42);
        });

        it("should support custom constructors",() => {
            let core = new InheritedCoreWithCustomConstructor();
            chai.expect(core.url).to.equal("mongodb://localhost/test");
        });
    });
});
