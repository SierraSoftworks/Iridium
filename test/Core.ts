import * as Iridium from "../iridium";
import * as events from "events";
import * as chai from "chai";
import * as MongoDB from "mongodb";

class InheritedCore extends Iridium.Core {
    theAnswer = 42;
}

class InheritedCoreWithCustomConstructor extends Iridium.Core {
    constructor() {
        super("mongodb://localhost/test");
    }
}

class InheritedCoreWithHooks extends Iridium.Core {
    constructor() {
        super("mongodb://localhost/test");
        this.events = new events.EventEmitter();
    }

    events: events.EventEmitter;

    onConnectingResult: (connection: MongoDB.Db) => Promise<any> = (connection) => Promise.resolve(connection);
    onConnectedResult: () => Promise<void> = () => Promise.resolve();

    protected onConnecting(client: MongoDB.MongoClient) {
        this.events.emit("connecting", client);
        return this.onConnectingResult(client.db("test"));
    }

    protected onConnected() {
        this.events.emit("connected");
        return this.onConnectedResult();
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
                database: "test"
            });
        });

        it("should throw an error if no URI or configuration object was provided",() => {
            chai.expect(() => new Iridium.Core(<any>undefined)).to.throw("Expected either a URI or config object to be supplied when initializing Iridium");
        });

        describe("should correctly convert the configuration object into a URI string", () => {
            it("when only a single host is specified",() => {
                let core = new Iridium.Core({
                    host: "localhost",
                    port: 27016,
                    database: "test",
                    username: "user",
                    password: "password"
                });

                chai.expect(core.url).to.equal("mongodb://user:password@localhost:27016/test");
            });

            it("when only a single host is specified with no port",() => {
                let core = new Iridium.Core({
                    host: "localhost",
                    database: "test",
                    username: "user",
                    password: "password"
                });

                chai.expect(core.url).to.equal("mongodb://user:password@localhost/test");
            });

            it("when multiple hosts are specified",() => {
                let core = new Iridium.Core({
                    hosts: [{ address: "localhost" }, { address: "127.0.0.1" }],
                    database: "test",
                    port: 27016,
                    username: "user",
                    password: "password"
                });

                chai.expect(core.url).to.equal("mongodb://user:password@localhost:27016,127.0.0.1:27016/test");
            });

            it("when multiple hosts are specified with no port",() => {
                let core = new Iridium.Core({
                    hosts: [{ address: "localhost" }, { address: "127.0.0.1" }],
                    database: "test",
                    username: "user",
                    password: "password"
                });

                chai.expect(core.url).to.equal("mongodb://user:password@localhost,127.0.0.1/test");
            });

            it("when multiple hosts are specified with different ports",() => {
                let core = new Iridium.Core({
                    hosts: [{ address: "localhost", port: 27016 }, { address: "127.0.0.1", port: 27017 }],
                    database: "test",
                    username: "user",
                    password: "password"
                });

                chai.expect(core.url).to.equal("mongodb://user:password@localhost:27016,127.0.0.1:27017/test");
            });

            it("when a combination of single and multiple hosts is specified",() => {
                let core = new Iridium.Core({
                    host: "localhost",
                    port: 27016,
                    hosts: [{ address: "localhost", port: 27017 }, { address: "127.0.0.1", port: 27018 }],
                    database: "test",
                    username: "user",
                    password: "password"
                });

                chai.expect(core.url).to.equal("mongodb://user:password@localhost:27016,localhost:27017,127.0.0.1:27018/test");
            });

            it("when a combination of single and multiple hosts is specified and there are duplicates",() => {
                let core = new Iridium.Core({
                    host: "localhost",
                    port: 27016,
                    hosts: [{ address: "localhost", port: 27016 }, { address: "127.0.0.1", port: 27017 }],
                    database: "test",
                    username: "user",
                    password: "password"
                });

                chai.expect(core.url).to.equal("mongodb://user:password@localhost:27016,127.0.0.1:27017/test");
            });
        });

        it("should make logical assumptions about the default host",() => {
            let core = new Iridium.Core({
                database: "test"
            });

            chai.expect(core.url).to.equal("mongodb://localhost/test");
        });

        it("should support passing connection level configuration information", () => {
            let core = new Iridium.Core({
                database: "test",
                options: {
                    connectTimeoutMS: 1000
                }
            });

            chai.expect(core.settings!.options).to.eql({
                connectTimeoutMS: 1000
            });
        });
    });

    describe("plugins",() => {
        let core = new Iridium.Core({
            database: "test"
        });

        let plugin = {
            newModel: (model: Iridium.Model<any, any>) => {

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
            database: "test"
        });

        it("should have an Express provider",() => {
            chai.expect(core.express).to.exist.and.be.a("function");
            chai.expect(core.express()).to.exist.and.be.a("function");
        });
    });

    describe("cache",() => {
        let core = new Iridium.Core({
            database: "test"
        });

        it("should have a default no-op cache provider",() => {
            chai.expect(core.cache).to.exist;
            core.cache.set("test", true);
            chai.expect(core.cache.get("test")).to.eventually.not.exist;
        });
    });

    describe("settings",() => {
        it("should be exposed via the settings property",() => {
            let core = new Iridium.Core({ database: "test" });
            chai.expect(core.settings).to.exist.and.eql({ database: "test" });
        });
    });

    describe("connect",() => {
        let core: Iridium.Core;
        after(() => core && core.close());

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
                database: "test"
            });

            chai.expect(core.url).to.equal("mongodb://localhost/test");
        });

        it("should pass through the properties of the object",() => {
            let core = new InheritedCore({
                database: "test"
            });

            chai.expect(core.theAnswer).to.equal(42);
        });

        it("should support custom constructors",() => {
            let core = new InheritedCoreWithCustomConstructor();
            chai.expect(core.url).to.equal("mongodb://localhost/test");
        });
    });

    describe("hooks", () => {
        let core: InheritedCoreWithHooks;
        beforeEach(() => {
            core = new InheritedCoreWithHooks()
        })
        
        afterEach(() => core.close())

        describe("onConnecting", () => {
            it("should be called whenever a low level connection is established", (done) => {
                core.events.once("connecting", (connection: MongoDB.Db) => {
                    done();
                });

                core.connect((err, core) => {
                    if(err) return done(err);
                    chai.expect(core).to.equal(core);
                });
            });

            it("should be passed the underlying connection", (done) => {
                core.events.once("connecting", (connection: MongoDB.Db) => {
                    chai.expect(connection).to.exist;
                    done();
                });

                core.connect((err, core) => {
                    if(err) return done(err);
                    chai.expect(core).to.equal(core);
                });
            });

            it("should be triggered before the connection is established", (done) => {
                core.events.once("connecting", (connection: MongoDB.Db) => {
                    chai.expect(() => core.connection).to.throw;
                    done();
                });

                core.connect((err, core) => {
                    if(err) return done(err);
                    chai.expect(core).to.equal(core);
                });
            });

            it("should abort the connection if it throws an error", () => {
                core.onConnectingResult = (conn) => Promise.reject(new Error("Test error"));

                return chai.expect(core.connect()).to.eventually.be.rejectedWith("Test error");
            });

            it("should leave the Iridium core disconnected if it throws an error", () => {
                core.onConnectingResult = (conn) => Promise.reject(new Error("Test error"));

                return chai.expect(core.connect().then(() => false, (err) => {
                    chai.expect(() => core.connection).to.throw;
                    return Promise.resolve(true);
                })).to.eventually.be.true;
            });
        });

        describe("onConnected", () => {
            it("should be called whenever a connection is accepted", (done) => {
                core.events.once("connected", () => {
                    done();
                });

                core.connect((err, core) => {
                    if(err) return done(err);
                    chai.expect(core).to.equal(core);
                });
            });

            it("should be triggered after the connection is accepted", (done) => {
                core.events.once("connected", () => {
                    chai.expect(core.connection).to.exist;
                    done();
                });

                core.connect((err, core) => {
                    if(err) return done(err);
                    chai.expect(core).to.equal(core);
                });
            });

            it("should abort the connection if it throws an error", () => {
                core.onConnectedResult = () => Promise.reject(new Error("Test error"));

                return chai.expect(core.connect()).to.eventually.be.rejectedWith("Test error");
            });

            it("should leave the Iridium core disconnected if it throws an error", () => {
                core.onConnectedResult = () => Promise.reject(new Error("Test error"));

                return chai.expect(core.connect().then(() => false, (err) => {
                    chai.expect(() => core.connection).to.throw;
                    return Promise.resolve(true);
                })).to.eventually.be.true;
            });
        });
    });
});
