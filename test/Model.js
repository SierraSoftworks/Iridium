var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Iridium = require('../index');
var Test = (function (_super) {
    __extends(Test, _super);
    function Test() {
        _super.apply(this, arguments);
    }
    return Test;
})(Iridium.Instance);
describe("Model", function () {
    var core = new Iridium.Core({ database: 'test' });
    describe("constructor", function () {
        it("should throw an error if you don't provide a valid core", function () {
            chai.expect(function () {
                new Iridium.Model(null, function () {
                }, 'test', { id: String });
            }).to.throw("You failed to provide a valid Iridium core for this model");
        });
        it("should throw an error if you don't provide a valid instanceType", function () {
            chai.expect(function () {
                new Iridium.Model(core, null, 'test', { id: String });
            }).to.throw("You failed to provide a valid instance constructor for this model");
        });
        it("should throw an error if you don't provide a collection name", function () {
            chai.expect(function () {
                new Iridium.Model(core, function () {
                }, null, { id: String });
            }).to.throw("You failed to provide a valid collection name for this model");
            chai.expect(function () {
                new Iridium.Model(core, function () {
                }, '', { id: String });
            }).to.throw("You failed to provide a valid collection name for this model");
            chai.expect(function () {
                new Iridium.Model(core, function () {
                }, 4, { id: String });
            }).to.throw("You failed to provide a valid collection name for this model");
        });
        it("should throw an error if you don't provide a valid schema", function () {
            chai.expect(function () {
                new Iridium.Model(core, function () {
                }, 'test', null);
            }).to.throw("You failed to provide a valid schema for this model");
            chai.expect(function () {
                new Iridium.Model(core, function () {
                }, 'test', {});
            }).to.throw("You failed to provide a valid schema for this model");
        });
        it("should correctly set the core", function () {
            chai.expect(new Iridium.Model(core, function () {
            }, 'test', { id: String }).core).to.equal(core);
        });
        it("should correctly set the collectionName", function () {
            chai.expect(new Iridium.Model(core, function () {
            }, 'test', { id: String }).collectionName).to.equal('test');
        });
        it("should correctly set the schema", function () {
            chai.expect(new Iridium.Model(core, function () {
            }, 'test', { id: String }).schema).to.eql({ id: String });
        });
    });
    describe("create", function () {
        var model = new Iridium.Model(core, Test, 'test', { answer: Number });
        before(function () {
            return core.connect();
        });
        it("should allow the insertion of a single document", function () {
            return chai.expect(model.create({ answer: 10 })).to.eventually.exist.and.have.property('answer', 10);
        });
        it("should allow the insertion of multiple documents", function () {
            return chai.expect(model.create([
                { answer: 11 },
                { answer: 12 },
                { answer: 13 }
            ])).to.eventually.exist.and.have.lengthOf(3);
        });
        it("should allow you to provide options to control the creation", function () {
            return chai.expect(model.create({ answer: 14 }, { w: 'majority' })).to.eventually.exist;
        });
    });
});
//# sourceMappingURL=Model.js.map