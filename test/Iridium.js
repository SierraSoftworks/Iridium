/// <reference path="../_references.d.ts" />
var Iridium = require('../index');
describe("Iridium", function () {
    it("should expose the Core", function () {
        chai.expect(Iridium.Core).to.exist.and.be.a('function');
    });
    it("should expose the Model constructor", function () {
        chai.expect(Iridium.Model).to.exist.and.be.a('function');
    });
    it("should expose the default Instance class", function () {
        chai.expect(Iridium.Instance).to.exist.and.be.a('function');
    });
});
//# sourceMappingURL=Iridium.js.map