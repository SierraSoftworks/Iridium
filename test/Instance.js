var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../_references.d.ts" />
var Iridium = require('../index');
var Test = (function (_super) {
    __extends(Test, _super);
    function Test() {
        _super.apply(this, arguments);
    }
    Test.prototype.test = function () {
        return true;
    };
    Object.defineProperty(Test.prototype, "ansqr", {
        get: function () {
            return this.answer * this.answer;
        },
        enumerable: true,
        configurable: true
    });
    return Test;
})(Iridium.Instance);
var TestDB = (function (_super) {
    __extends(TestDB, _super);
    function TestDB() {
        _super.call(this, "mongodb://localhost/test");
        this.Test = new Iridium.Model(this, Test, 'test', { id: false, answer: Number });
    }
    return TestDB;
})(Iridium.Core);
describe("Instance", function () {
    var core = new TestDB();
    before(function () { return core.connect(); });
    after(function () { return core.close(); });
    it("should expose the latest document values", function () {
        var instance = core.Test.helpers.wrapDocument({
            id: 'aaaaaa',
            answer: 2
        });
        chai.expect(instance).to.exist;
        chai.expect(instance.answer).to.be.equal(2);
        chai.expect(instance.id).to.be.equal('aaaaaa');
    });
    describe("methods", function () {
        it("should expose save()", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).save).to.exist.and.be.a('function');
        });
        it("should expose update()", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).update).to.exist.and.be.a('function');
        });
        it("should expose refresh()", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).refresh).to.exist.and.be.a('function');
        });
        it("should expose delete()", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).delete).to.exist.and.be.a('function');
        });
        it("should expose remove()", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).remove).to.exist.and.be.a('function');
        });
        it("should override toJSON()", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).toJSON()).to.eql({ id: '1', answer: 2 });
        });
        it("should override toString()", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).toString()).to.eql(JSON.stringify({ id: '1', answer: 2 }, null, 2));
        });
    });
    describe("properties", function () {
        it("should expose document", function () {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).document).to.eql({ id: '1', answer: 2 });
        });
    });
    it("should expose additional getters and setters", function () {
        var instance = core.Test.helpers.wrapDocument({
            id: 'aaaaaa',
            answer: 2
        });
        chai.expect(instance).to.exist;
        chai.expect(instance.ansqr).to.exist.and.be.equal(4);
    });
    it("should expose additional methods", function () {
        var instance = core.Test.helpers.wrapDocument({
            id: 'aaaaaa',
            answer: 2
        });
        chai.expect(instance).to.exist;
        chai.expect(instance.test).to.exist.and.be.a('function');
    });
});
//# sourceMappingURL=Instance.js.map