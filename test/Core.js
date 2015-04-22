var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../_references.d.ts" />
var Iridium = require('../index');
var InheritedCore = (function (_super) {
    __extends(InheritedCore, _super);
    function InheritedCore() {
        _super.apply(this, arguments);
        this.theAnswer = 42;
    }
    return InheritedCore;
})(Iridium.Core);
var InheritedCoreWithCustomConstructor = (function (_super) {
    __extends(InheritedCoreWithCustomConstructor, _super);
    function InheritedCoreWithCustomConstructor() {
        _super.call(this, "mongodb://localhost/test");
    }
    return InheritedCoreWithCustomConstructor;
})(Iridium.Core);
describe("Core", function () {
    describe("constructor", function () {
        it("should accept a URI string", function () {
            var core = new Iridium.Core("mongodb://localhost/test");
            chai.expect(core.url).to.equal("mongodb://localhost/test");
        });
        it("should accept a configuration object", function () {
            new Iridium.Core({
                database: 'test'
            });
        });
        it("should correctly convert the configuration object into a URI string", function () {
            var core = new Iridium.Core({
                host: 'localhost',
                port: 27016,
                database: 'test',
                username: 'user',
                password: 'password'
            });
            chai.expect(core.url).to.equal("mongodb://user:password@localhost:27016/test");
        });
        it("should make logical assumptions about the default host", function () {
            var core = new Iridium.Core({
                database: 'test'
            });
            chai.expect(core.url).to.equal("mongodb://localhost/test");
        });
    });
    describe("plugins", function () {
        var core = new Iridium.Core({
            database: 'test'
        });
        var plugin = {
            newModel: function (model) {
            }
        };
        it("should be registered through the register method", function () {
            chai.expect(core.register(plugin)).to.equal(core);
        });
        it("should then be available through the plugins collection", function () {
            chai.expect(core.plugins).to.contain(plugin);
        });
    });
    describe("middleware", function () {
        var core = new Iridium.Core({
            database: 'test'
        });
        it("should have an Express provider", function () {
            chai.expect(core.express).to.exist.and.be.a('function');
        });
    });
    describe("cache", function () {
        var core = new Iridium.Core({
            database: 'test'
        });
        it("should have a default no-op cache provider", function () {
            chai.expect(core.cache).to.exist;
            return core.cache.set("test", true).then(function () {
                chai.expect(core.cache.get("test")).to.eventually.not.exist;
            });
        });
    });
    describe("connect", function () {
        var core;
        it("should return a rejection if the connection fails", function () {
            core = new Iridium.Core("mongodb://0.0.0.0/test");
            return chai.expect(core.connect()).to.be.rejected;
        });
        it("should open a connection to the correct database and return the core", function () {
            core = new Iridium.Core("mongodb://localhost/test");
            return chai.expect(core.connect()).to.eventually.exist.and.equal(core);
        });
        it("should then be able to close the connection", function () {
            return core.close();
        });
    });
    describe("close", function () {
        var core = new Iridium.Core("mongodb://localhost/test");
        it("should not fail if called when not connected", function () {
            return core.close();
        });
        it("should chain promises", function () {
            chai.expect(core.close()).to.eventually.equal(core);
        });
    });
    describe("inheritance", function () {
        it("should allow a class to extend the core", function () {
            chai.expect(InheritedCore).to.exist;
            chai.expect(new InheritedCore("mongodb://localhost/test")).to.be.an.instanceof(Iridium.Core);
        });
        it("should pass through constructor arguments to the core", function () {
            var core = new InheritedCore({
                database: 'test'
            });
            chai.expect(core.url).to.equal("mongodb://localhost/test");
        });
        it("should pass through the properties of the object", function () {
            var core = new InheritedCore({
                database: 'test'
            });
            chai.expect(core.theAnswer).to.equal(42);
        });
        it("should support custom constructors", function () {
            var core = new InheritedCoreWithCustomConstructor();
            chai.expect(core.url).to.equal("mongodb://localhost/test");
        });
    });
});
//# sourceMappingURL=Core.js.map