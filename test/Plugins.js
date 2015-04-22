var Iridium = require('../index');
describe("Plugins", function () {
    var core = new Iridium.Core({ database: 'test' });
    it("should be registered with an Iridium Core", function () {
        core.register({
            newModel: function (model) {
            }
        });
    });
    describe("newModel", function () {
        it("should allow a plugin not to define a handler");
        it("should be called when a new model is created");
    });
    describe("newInstance", function () {
        it("should allow a plugin not to define a handler");
        it("should be called when a new instance is created");
    });
    describe("validators", function () {
        it("should make schema validators available for models");
        it("should allow a plugin to not define any schema validators");
    });
});
//# sourceMappingURL=Plugins.js.map